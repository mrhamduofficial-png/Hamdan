export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hamdan-mocha.vercel.app',
        'X-Title': 'Hamdan AI'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: 'You are Hamdan AI, a helpful assistant. Give detailed and helpful responses.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'API Error: ' + errText });
    }
    
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'No response generated';
    res.status(200).json({ text });
    
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
