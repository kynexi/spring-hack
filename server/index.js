require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");
const OpenAI = require("openai");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const rateLimit = require("express-rate-limit");
const fs = require("fs");

// Initialize Express first
const app = express();

// Initialize OpenAI
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Define PORT
const PORT = process.env.PORT || 5001;

// Initialize rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware Setup
app.use(
  cors({
    origin: "http://localhost:3002",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
    credentials: true,
    maxAge: 86400, // PREFLIGHT CACHE 1 DAY
  })
);

app.use(express.json());

// Apply rate limiting to API routes
app.use("/api/", apiLimiter);

// File upload middleware
// Remove the duplicate fileUpload middleware and update the configuration
// Update the file upload middleware configuration
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: "./tmp/",
    debug: process.env.NODE_ENV === "development",
    safeFileNames: true,
    preserveExtension: true,
    createParentPath: true,
    parseNested: true,
  })
);

// ... rest of your code ...
const tmpDir = "./tmp";
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log("Created tmp directory");
}
// Helper Functions
async function processContent(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Changed to cheaper model
      messages: [
        {
          role: "system",
          content:
            "Convert educational content into engaging, bite-sized summaries. Format: Title, Key Points, Fun Fact. Keep it concise and engaging for Gen-Z audience.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to process content with AI");
  }
}
// Update the generateReels function
async function generateReels(file) {
  try {
    let text;
    const fileExt = path.extname(file.name).toLowerCase();
    console.log(`Processing file with extension: ${fileExt}`);

    // Handle PDF files
    if (fileExt === ".pdf") {
      try {
        // Read from temp file instead of buffer
        const pdfBuffer = fs.readFileSync(file.tempFilePath);
        const data = await pdfParse(pdfBuffer);
        text = data.text;

        // Clean up temp file
        fs.unlinkSync(file.tempFilePath);
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        throw new Error(
          "Could not parse PDF file. Please ensure it is not corrupted."
        );
      }
    }
    // Handle Word documents
    else if ([".docx", ".doc"].includes(fileExt)) {
      try {
        const result = await mammoth.extractRawText({ buffer: file.data });
        text = result.value;
      } catch (docError) {
        console.error("Word document parsing error:", docError);
        throw new Error(
          "Could not parse Word document. Please ensure it is not corrupted."
        );
      }
    } else {
      throw new Error(
        "Unsupported file type. Please upload PDF or Word documents."
      );
    }

    if (!text || text.trim().length === 0) {
      throw new Error("No text content found in the file");
    }

    // Split into chunks and process
    const chunks = text
      .split(/\n\n+/)
      .filter((chunk) => chunk.trim().length > 50)
      .slice(0, 10);

    console.log(`Generated ${chunks.length} chunks from file`);

    const reels = await Promise.all(
      chunks.map(async (chunk, index) => {
        const summary = await processContent(chunk);
        return {
          id: index + 1,
          title: `Part ${index + 1}`,
          description: summary,
          originalContent: chunk.substring(0, 200) + "...",
        };
      })
    );

    return reels;
  } catch (error) {
    console.error("Generate reels error:", error);
    throw error;
  }
}

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Update the upload route
app.post("/api/upload", async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;
    tempFilePath = file.tempFilePath; // Store for cleanup

    console.log(`Processing file: ${file.name}, Size: ${file.size} bytes`);

    const reels = await generateReels(file);

    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    if (!reels || reels.length === 0) {
      throw new Error("Could not generate content from file");
    }

    res.json({
      success: true,
      slides: reels,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        slideCount: reels.length,
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Clean up temp file on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    console.error("Upload error:", error);
    res.status(500).json({
      error: error.message || "Failed to process file",
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware
// Add before server.listen()

// Error handling middleware (keep at the bottom)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// Start server
// filepath: c:\Users\vasya\Desktop\spring-hack\spring-hack\server\index.js
const server = app.listen(PORT, () => {
  console.log(`
    🚀 Server running on http://localhost:${PORT}
    📁 Max file size: 50MB
    🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? "Set" : "Missing!"}
  `);
  // Disable timeout (not recommended in production)
  server.timeout = 0;
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nGracefully shutting down...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
