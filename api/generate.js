export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // आपकी लाइव जेमिनी API की यहाँ सेट कर दी है
  const GEMINI_API_KEY = "AIzaSyCUzBsmcOP3ug629YdlrT8-puMQ6qlu8As";

  try {
    // Google Gemini 1.5 Flash API Call
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error Response:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Gemini API से कनेक्ट करने में समस्या आ रही है।' 
      });
    }

    // जेमिनी के रिस्पांस से असली टेक्स्ट निकालना
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const generatedText = data.candidates[0].content.parts[0].text;
      return res.status(200).send(generatedText);
    } else {
      return res.status(500).json({ error: 'API से सही फॉर्मेट में डेटा नहीं मिला।' });
    }

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'सर्वर में कुछ गड़बड़ी है: ' + error.message });
  }
}
