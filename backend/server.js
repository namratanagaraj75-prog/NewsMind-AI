const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

console.log("=================================");
console.log("Server Starting...");
console.log("API Key Loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");
console.log("=================================");

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NewsMind AI Backend Running",
  });
});

app.post("/summarize", async (req, res) => {
  try {
    const { article } = req.body;

    if (!article || article.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Article text is required",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Return ONLY valid JSON.

Do not include markdown.
Do not include backticks.
Do not include explanations.

Return exactly in this format:

{
  "summary50": "string",
  "summary100": "string",
  "highlights": [
    "string",
    "string",
    "string",
    "string",
    "string"
  ],
  "facts": [
    "string",
    "string",
    "string"
  ],
  "seoHeadlines": [
    "string",
    "string",
    "string"
  ],
  "socialPost": "string",
  "readingTime": "string"
}

Analyze this article:

${article}
`;

    const result = await model.generateContent(prompt);

    let responseText = result.response.text();

    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedData;

    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);

      console.error("Gemini Returned:", responseText);

      return res.status(500).json({
        success: false,
        error: "AI returned invalid JSON format",
      });
    }

    res.status(200).json({
      success: true,
      data: parsedData,
    });
  } catch (error) {
    console.error("Gemini Error:");
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to summarize article",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
