const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  })
);

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Upload endpoint
app.post("/api/upload", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;
    const fileExt = path.extname(file.name).toLowerCase();

    // Process file based on type
    if (fileExt === ".pdf") {
      const pdfData = await pdfParse(file.data);
      const slides = pdfData.text
        .split(/\n\n+/)
        .filter((text) => text.trim())
        .map((text, index) => ({
          id: index + 1,
          title: `Slide ${index + 1}`,
          content: text.trim().substring(0, 200), // Limit length
        }));

      res.json({ success: true, slides });
    } else {
      // Mock data for other file types
      res.json({
        success: true,
        slides: [
          { id: 1, title: "Slide 1", content: "Welcome!" },
          { id: 2, title: "Slide 2", content: "Content here" },
          { id: 3, title: "Slide 3", content: "Thank you!" },
        ],
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to process file" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
