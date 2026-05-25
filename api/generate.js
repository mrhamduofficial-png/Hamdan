export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).send('GROQ_API_KEY missing in Vercel');

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are Hamdan AI, a powerful and helpful AI assistant. Always give detailed, high-quality, and useful responses.'
          },
          { role: 'user', content: prompt }
        ],
        stream: false,
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(500).send('Groq API Error: ' + errText);
    }

    const data = await groqRes.json();
    const text = data.choices?.[0]?.message?.content || 'No response generated';
    res.status(200).send(text);

  } catch (e) {
    res.status(500).send('Server Error: ' + e.message);
  }
}
