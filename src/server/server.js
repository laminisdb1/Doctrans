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

// Initialize DeepL with a longer timeout (60 seconds)
const translator = new deepl.Translator(process.env.DEEPL_API_KEY, {
  minTimeout: 60000, // 60 seconds
});

const mockDB = { documents: {} };

// ==========================================
// REAL TRANSLATION ROUTE
// ==========================================
app.post("/api/translate", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { targetLang, email } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded." });

    console.log(`Translating ${file.originalname} to ${targetLang}...`);

    // Format languages for DeepL
    const getLangCode = (langString) => {
      if (!langString || langString === "Auto-Detect") return null;
      if (langString.includes("French")) return "fr";
      if (langString.includes("English")) return "en-US";
      if (langString.includes("Spanish")) return "es";
      return null;
    };

    const targetCode = getLangCode(targetLang);
    const sourceCode = getLangCode(req.body.sourceLang);

    // Output file path
    const translatedFilename = `translated-${Date.now()}-${file.originalname}`;
    const outputPath = path.join(__dirname, "uploads", translatedFilename);

    // Translate the document using DeepL
    await translator.translateDocument(
      file.path, 
      outputPath, 
      sourceCode, 
      targetCode
    );

    // Delete the original uploaded file
    try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }

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

    console.log(`✅ Translation successful! Saved as ${translatedFilename}`);
    res.status(200).json({ success: true, document: newDocument });

  } catch (error) {
    console.error("Translation Error:", error);
    res.status(500).json({ error: "Translation failed. Check backend logs." });
  }
});

app.get("/api/documents", (req, res) => {
  res.status(200).json(mockDB.documents[req.query.email] || []);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));