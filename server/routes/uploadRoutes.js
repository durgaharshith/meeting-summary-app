import { Router } from "express";
import multer from "multer";
import fs from "fs";
import mammoth from "mammoth";

const router = Router();
const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// POST /api/upload/transcript
router.post("/transcript", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded" });

    const { path: filePath, mimetype, originalname } = req.file;
    let transcriptText = "";

    console.log(`Processing file: ${originalname}, type: ${mimetype}`);

    // text/plain (.txt)
    if (mimetype === "text/plain" || originalname.endsWith(".txt")) {
      console.log("Processing as text file");
      transcriptText = fs.readFileSync(filePath, "utf8");
    }
    // docx
    else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      originalname.endsWith(".docx")
    ) {
      console.log("Processing as DOCX file");
      try {
        const buffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer });
        transcriptText = result.value;
      } catch (docxError) {
        console.error("DOCX parsing error:", docxError);
        return res.status(400).json({ success: false, error: "Failed to parse DOCX file" });
      }
    }
    // pdf - temporarily disabled
    else if (mimetype === "application/pdf" || originalname.endsWith(".pdf")) {
      console.log("PDF file detected - currently not supported");
      fs.unlinkSync(filePath); // cleanup
      return res.status(400).json({ 
        success: false, 
        error: "PDF support is temporarily disabled. Please convert your PDF to a TXT or DOCX file and try again." 
      });
    }
    else {
      console.log("Unsupported file type");
      fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, error: "Unsupported file format. Please use TXT or DOCX files." });
    }

    // cleanup
    try { 
      fs.unlinkSync(filePath); 
      console.log("Temporary file cleaned up");
    } catch (e) {
      console.log("Cleanup warning:", e.message);
    }

    console.log(`Extracted text length: ${transcriptText.length} characters`);
    
    if (!transcriptText.trim()) {
      return res.status(400).json({ success: false, error: "No text content found in the file" });
    }

    return res.json({ success: true, transcript: transcriptText.trim() });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, error: "Failed to process transcript" });
  }
});

export default router;