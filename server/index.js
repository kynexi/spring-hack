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
const { Voice, VoiceSettings, Category, Model } = require("@elevenlabs/node");

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

// voiceover function

async function generateVoiceover(text) {
  try {
    const voice = new Voice({
      apiKey: process.env.ELEVENLABS_API_KEY,
      voiceId: "21m00Tcm4TlvDq8ikWAM", // Default voice ID (you can change this)
      settings: new VoiceSettings({
        stability: 0.5,
        similarity_boost: 0.75,
      }),
    });

    const audioBuffer = await voice.textToSpeech(text);

    // Generate unique filename
    const fileName = `voiceover-${Date.now()}.mp3`;
    const filePath = path.join(__dirname, "tmp", fileName);

    // Save audio file
    fs.writeFileSync(filePath, audioBuffer);

    return fileName;
  } catch (error) {
    console.error("Voiceover generation error:", error);
    throw new Error("Failed to generate voiceover");
  }
}

// Helper Functions
async function processContent(text) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an engaging teacher who explains complex topics in simple terms.
          Your response MUST be valid JSON in this exact format (no other text allowed):
          {
            "title": "Topic Title 📚",
            "intro": "One-line introduction to the concept",
            "simpleExplanation": "Explain the concept like you're talking to a beginner. Use simple analogies and everyday examples. Keep it under 3 sentences.",
            "funExample": "A real-world example or fun fact that makes this concept memorable",
            "voiceoverScript": "A conversational version of the explanation for text-to-speech"
          }`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const content = JSON.parse(response.choices[0].message.content);

    // Generate voiceover for the script
    const voiceoverFile = await generateVoiceover(content.voiceoverScript);

    return {
      title: content.title,
      intro: content.intro,
      simpleExplanation: content.simpleExplanation,
      funExample: content.funExample,
      voiceover: voiceoverFile,
    };
  } catch (error) {
    console.error("Content processing error:", error);
    throw error;
  }
}

// Update the generateReels function's mapping to include more metadata

// Update the generateReels function
async function generateReels(file) {
  try {
    let text;
    const fileExt = path.extname(file.name).toLowerCase();
    console.log(`Processing file with extension: ${fileExt}`);

    // Handle PDF files
    if (fileExt === ".pdf") {
      try {
        const pdfBuffer = fs.readFileSync(file.tempFilePath);
        const data = await pdfParse(pdfBuffer);
        text = data.text;
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

    // Process chunks sequentially
    const reels = [];
    for (let index = 0; index < chunks.length; index++) {
      console.log(`Processing chunk ${index + 1}...`);
      const chunk = chunks[index];
      const summary = await processContent(chunk);
      // Inside generateReels function, update the reels.push() call:
      reels.push({
        id: index + 1,
        title: `Part ${index + 1}`,
        description: summary.simpleExplanation,
        originalContent: chunk.substring(0, 200) + "...",
        voiceoverUrl: `/api/voiceover/${summary.voiceover}`,
        timestamp: new Date().toISOString(),
      });
    }

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
// Add this route before app.listen()
app.get("/api/voiceover/:filename", (req, res) => {
  const filePath = path.join(__dirname, "tmp", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Voiceover file not found" });
  }
});

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
