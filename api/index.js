import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

if (process.env.VERCEL_URL) {
  // process.env.VERCEL_URL typically comes as 'your-app-name.vercel.app'
  // The origin sent by the browser will include the protocol.
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like direct API calls, Postman, curl)
      // or requests from the explicitly allowed origins.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(
          new Error(
            "The CORS policy for this site does not allow access from the specified Origin."
          ),
          false
        );
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.0-flash";

/**
 * Generates a detailed prompt for summarizing a playlist based on video titles and descriptions.
 * The prompt guides the model to act as an expert content analyst and provide structured output.
 * @param {Array<Object>} videos - An array of video objects, each containing 'title' and 'description'.
 * @returns {string} The formatted prompt string for the Gemini model.
 */
const generatePrompt = (videos) => {
  const listText = videos
    .map(
      (v, idx) =>
        `(${idx + 1}) Title: ${v.title}\nDescription: ${v.description}`
    )
    .join("\n\n");

  return `You are an expert YouTube content analyst.
Given a playlist of videos, summarize it in a clear, coherent, structured, and engaging manner for users.
Your summary should be formatted using **Markdown**.

Please include the following sections:

**1. Overall Theme & Purpose:**
- What is the main subject or purpose of this playlist?
- What problem does it solve or what knowledge does it impart?

**2. Key Topics Covered:**
- List the most important topics, concepts, or skills taught/discussed using bullet points.

**3. Target Audience:**
- Who would find this playlist most useful (e.g., beginners, advanced users, specific professionals)?

**4. Format & Style:**
- Describe the general format (e.g., tutorials, lectures, vlogs, discussions) and the overall tone.

**5. Progression or Series Flow (if applicable):**
- Does the playlist follow a specific order or progression? If so, briefly explain.

**6. Highlights/Standout Videos (Optional, if clear from titles/descriptions):**
- Mention any particularly important or popular videos that stand out.

Playlist Videos:
${listText}

Now, provide a summary:`;
};

app.post("/api/summarize", async (req, res) => {
  try {
    const { videos } = req.body;
    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({
        error:
          "Invalid input: 'videos' must be a non-empty array of video objects.",
      });
    }

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = generatePrompt(videos);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ summary: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error:
        "Failed to summarize playlist. Please check server logs for details.",
    });
  }
});

// Conditional listen statement for local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Playlist summarizer backend running on port ${PORT}`);
  });
}

// IMPORTANT: Export the app for Vercel's serverless function environment
export default app;
