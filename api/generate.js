export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).send('API key missing in Vercel');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hamdan-mocha.vercel.app',
        'X-Title': 'Hamdan AI'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are Hamdan AI, a powerful and helpful assistant. Give detailed, high-quality responses.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).send('API Error: ' + errText);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'No response generated';
    res.status(200).send(text);

  } catch (e) {
    res.status(500).send('Error: ' + e.message);
  }
}
