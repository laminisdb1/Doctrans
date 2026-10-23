const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const deepl = require("deepl-node");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure upload folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Initialize DeepL with a 60-second timeout
const translator = new deepl.Translator(process.env.DEEPL_API_KEY, {
  minTimeout: 60000, 
});

// ==========================================
// MOCK DATABASE (Replace with Supabase later)
// ==========================================
const mockDB = {
  users: {},     // Format: { "email": { plan: "Free", translationsUsed: 0 } }
  documents: {}  // Format: { "email": [ { id, name, lang, date, status, url } ] }
};

const MAX_FREE_TRANSLATIONS = 2;

// ==========================================
// TRANSLATION ROUTE (With Limit Check)
// ==========================================
app.post("/api/translate", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { targetLang, email } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded." });
    if (!email) return res.status(400).json({ error: "Email required." });

    // 1. Initialize user if they don't exist
    if (!mockDB.users[email]) {
      mockDB.users[email] = { plan: "Free", translationsUsed: 0 };
    }
    
    const user = mockDB.users[email];

    // 2. Check if Free Limit Reached
    if (user.plan === "Free" && user.translationsUsed >= MAX_FREE_TRANSLATIONS) {
      if (file) try { fs.unlinkSync(file.path); } catch (e) {} // Delete file
      return res.status(403).json({ 
        error: "FREE_LIMIT_REACHED", 
        message: "You have used your 2 free translations. Please upgrade to Pro." 
      });
    }

    console.log(`Translating ${file.originalname} for ${email} (Usage: ${user.translationsUsed}/${MAX_FREE_TRANSLATIONS})...`);

    // 3. Format languages for DeepL
    const getLangCode = (langString) => {
      if (!langString || langString === "Auto-Detect") return null;
      if (langString.includes("French")) return "fr";
      if (langString.includes("English")) return "en-US";
      if (langString.includes("Spanish")) return "es";
      return null;
    };

    const targetCode = getLangCode(targetLang);
    const sourceCode = getLangCode(req.body.sourceLang);

    const translatedFilename = `translated-${Date.now()}-${file.originalname}`;
    const outputPath = path.join(__dirname, "uploads", translatedFilename);

    // 4. Translate with DeepL
    await translator.translateDocument(file.path, outputPath, sourceCode, targetCode);
    try { fs.unlinkSync(file.path); } catch (e) {}

    // 5. Increment usage
    user.translationsUsed += 1;

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${translatedFilename}`;
    const newDocument = {
      id: Date.now().toString(),
      name: file.originalname,
      lang: targetLang,
      date: new Date().toLocaleDateString(),
      status: "Done",
      url: fileUrl
    };

    if (!mockDB.documents[email]) mockDB.documents[email] = [];
    mockDB.documents[email].unshift(newDocument);

    console.log(`✅ Translation successful! Total used: ${user.translationsUsed}`);
    res.status(200).json({ success: true, document: newDocument, translationsUsed: user.translationsUsed });

  } catch (error) {
    console.error("Translation Error:", error);
    res.status(500).json({ error: "Translation failed. Check backend logs." });
  }
});

// ==========================================
// FETCH ACCOUNT STATUS (For Sidebar Usage UI)
// ==========================================
app.get("/api/account", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  const user = mockDB.users[email] || { plan: "Free", translationsUsed: 0 };
  
  res.status(200).json({ 
    subscription: { 
      plan: user.plan, 
      status: user.plan !== "Free" ? "active" : "inactive",
      translationsUsed: user.translationsUsed
    } 
  });
});

// ==========================================
// FETCH USER DOCUMENTS
// ==========================================
app.get("/api/documents", (req, res) => {
  res.status(200).json(mockDB.documents[req.query.email] || []);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));