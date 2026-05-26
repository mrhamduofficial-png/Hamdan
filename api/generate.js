import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Invalid or missing prompt" });
  }

  // Check if API key exists
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_GEMINI_API_KEY not found in environment variables");
    return res.status(500).json({ error: "API key not configured. Contact admin." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Return the generated text
    res.status(200).send(text);
  } catch (error) {
    console.error("API Error Details:", error);

    // Handle specific error types
    if (error.message && error.message.includes("401")) {
      return res.status(401).json({ 
        error: "Authentication failed. API key is invalid or expired. Check Vercel environment variables." 
      });
    } else if (error.message && error.message.includes("quota")) {
      return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
    }

    res.status(500).json({
      error: error.message || "Failed to generate content",
    });
  }
}
