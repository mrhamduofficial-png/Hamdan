import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Invalid or missing prompt" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Return the generated text
    res.status(200).send(text);
  } catch (error) {
    console.error("API Error:", error);

    // Handle specific error types
    if (error.message.includes("API key")) {
      return res
        .status(401)
        .json({ error: "Authentication failed. Check API key." });
    } else if (error.message.includes("quota")) {
      return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
    }

    res.status(500).json({
      error: error.message || "Failed to generate content",
    });
  }
}