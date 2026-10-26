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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

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

    // --- SAFE USER FETCHING ---
    let { data: user, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle(); // maybeSingle prevents PGRST116 error if user doesn't exist

    if (fetchError) {
      console.error("Supabase Fetch Error:", fetchError);
      throw new Error("Database error fetching user profile.");
    }

    if (!user) {
      // Create new user
      const { data: newUser, error: insertError } = await supabase
        .from("profiles")
        .insert([{ email, plan: "Free", translations_used: 0 }])
        .select()
        .maybeSingle();

      if (insertError) {
        console.error("Supabase Insert Error:", insertError);
        throw new Error(`Failed to create user: ${insertError.message}`);
      }
      user = newUser;
    }

    if (!user) throw new Error("Failed to find or create user in database.");

    // Ensure translations_used is a number
    const currentUsage = user.translations_used || 0;

    // --- CHECK LIMIT ---
    if (user.plan === "Free" && currentUsage >= MAX_FREE_TRANSLATIONS) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      return res.status(403).json({ error: "FREE_LIMIT_REACHED" });
    }

    // --- TRANSLATE ---
    const getLangCode = (str) => {
      if (!str || str === "Auto-Detect") return null;
      if (str.includes("French")) return "fr";
      if (str.includes("English")) return "en-US";
      if (str.includes("Spanish")) return "es";
      return null;
    };

    const translatedFilename = `translated-${Date.now()}-${file.originalname}`;
    const outputPath = path.join(__dirname, "uploads", translatedFilename);

    await translator.translateDocument(
      file.path, 
      outputPath, 
      getLangCode(sourceLang), 
      getLangCode(targetLang)
    );

    try { fs.unlinkSync(file.path); } catch (e) {}

    // --- INCREMENT USAGE ---
    const newUsageCount = currentUsage + 1;
    await supabase
      .from("profiles")
      .update({ translations_used: newUsageCount })
      .eq("email", email);

    // --- SAVE DOCUMENT ---
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${translatedFilename}`;
    const newDocument = {
      email: email, 
      name: file.originalname, 
      lang: targetLang,
      date: new Date().toLocaleDateString(), 
      status: "Done", 
      url: fileUrl
    };
    
    const { data: savedDoc, error: docError } = await supabase
      .from("documents") 
      .insert([newDocument])
      .select()
      .maybeSingle();

    if (docError) {
      console.error("Supabase Document Error:", docError);
      throw new Error(`Failed to save document record: ${docError.message}`);
    }

    res.status(200).json({ 
      success: true, 
      document: savedDoc, 
      translationsUsed: newUsageCount 
    });

  } catch (error) {
    console.error("Translation Error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    // Send the exact error message to the frontend
    res.status(500).json({ error: error.message || "Translation failed." });
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
    .maybeSingle();
  
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
  console.log(`🚀 Backend running on port 10000`);
});