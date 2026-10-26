const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const deepl = require("deepl-node");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

// ==========================================
// 1. MIDDLEWARE & CONFIGURATION
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the uploads folder so files can be downloaded
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure the 'uploads' folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB limit
});

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Initialize DeepL (with 60-second timeout to prevent premature fails)
const translator = new deepl.Translator(process.env.DEEPL_API_KEY, {
  minTimeout: 60000, 
});

const MAX_FREE_TRANSLATIONS = 2;

// ==========================================
// 2. TRANSLATION ROUTE
// ==========================================
app.post("/api/translate", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { targetLang, email, sourceLang } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded." });
    if (!email) return res.status(400).json({ error: "Email required." });

    // Fetch User from Supabase
    let { data: user, error } = await supabase
      .from("profliles")
      .select("*")
      .eq("email", email)
      .single();
    
    // If user doesn't exist, create them
    if (error && error.code === "PGRST116") {
      const { data: newUser } = await supabase
        .from("profiles")
        .insert([{ email, plan: "Free", translations_used: 0 }])
        .select()
        .single();
      user = newUser;
    }

    // Ensure translations_used is a number
    const currentUsage = user.translations_used || 0;

    // Block if Free Limit Reached
    if (user.plan === "Free" && currentUsage >= MAX_FREE_TRANSLATIONS) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      return res.status(403).json({ error: "FREE_LIMIT_REACHED" });
    }

    // Format languages for DeepL
    const getLangCode = (str) => {
      if (!str || str === "Auto-Detect") return null;
      if (str.includes("French")) return "fr";
      if (str.includes("English")) return "en-US";
      if (str.includes("Spanish")) return "es";
      return null;
    };

    const translatedFilename = `translated-${Date.now()}-${file.originalname}`;
    const outputPath = path.join(__dirname, "uploads", translatedFilename);

    // Translate with DeepL
    await translator.translateDocument(
      file.path, 
      outputPath, 
      getLangCode(sourceLang), 
      getLangCode(targetLang)
    );

    // Delete the original file
    try { fs.unlinkSync(file.path); } catch (e) {}

    // Increment Usage in Supabase
    const newUsageCount = currentUsage + 1;
    await supabase
      .from("profiles")
      .update({ translations_used: newUsageCount })
      .eq("email", email);

    // Save Document Record to Supabase
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${translatedFilename}`;
    const newDocument = {
      email: email, 
      name: file.originalname, 
      lang: targetLang,
      date: new Date().toLocaleDateString(), 
      status: "Done", 
      url: fileUrl
    };
    
    const { data: savedDoc } = await supabase
      .from("documents")
      .insert([newDocument])
      .select()
      .single();

    res.status(200).json({ 
      success: true, 
      document: savedDoc, 
      translationsUsed: newUsageCount 
    });

  } catch (error) {
    console.error("Translation Error:", error);
    // Cleanup file if an error occurs during translation
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ error: "Translation failed. Check backend logs." });
  }
});

// ==========================================
// 3. FETCH ACCOUNT STATUS
// ==========================================
app.get("/api/account", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  const { data: user } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();
  
  if (!user) {
    return res.status(200).json({ 
      subscription: { plan: "Free", status: "inactive", translationsUsed: 0 } 
    });
  }

  res.status(200).json({ 
    subscription: { 
      plan: user.plan, 
      status: user.plan !== "Free" ? "active" : "inactive",
      translationsUsed: user.translations_used || 0
    } 
  });
});

// ==========================================
// 4. FETCH USER DOCUMENTS
// ==========================================
app.get("/api/documents", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false });

  res.status(200).json(docs || []);
});

// ==========================================
// 5. START SERVER
// ==========================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});