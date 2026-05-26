import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract the text content from the response
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return res.status(500).json({ error: "Unexpected response format" });
    }

    // Return the generated text
    res.status(200).send(textContent.text);
  } catch (error) {
    console.error("API Error:", error);

    // Handle specific error types
    if (error.status === 401) {
      return res
        .status(401)
        .json({ error: "Authentication failed. Check API key." });
    } else if (error.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
    } else if (error.status === 500) {
      return res.status(500).json({ error: "AI service error. Try again." });
    }

    res.status(500).json({
      error: error.message || "Failed to generate content",
    });
  }
}