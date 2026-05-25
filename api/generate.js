// api/generate.js — Vercel Serverless Function

const API_KEY = process.env.GROQ_API_KEY;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CHECK: API Key hai ya nahi?
  if (!API_KEY) {
    return res.status(500).json({
      error: 'GROQ_API_KEY is not set. Add it in Vercel → Settings → Environment Variables',
      debug: { keyExists: false }
    });
  }

  // CHECK: Key format sahi hai?
  if (!API_KEY.startsWith('gsk_')) {
    return res.status(500).json({
      error: 'GROQ_API_KEY is invalid. Must start with gsk_',
      debug: { keyPrefix: API_KEY.substring(0, 4) }
    });
  }

  const { messages, model, temperature, max_tokens } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'llama-3.1-8b-instant',
        messages: messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: `Groq API error: ${errorData.error?.message || 'Unknown'}`,
        statusCode: response.status
      });
    }

    const data = await response.json();

    return res.status(200).json({
      result: data.choices?.[0]?.message?.content || 'No response',
      usage: data.usage,
      model: data.model
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to connect to Groq API',
      details: error.message
    });
  }
}
