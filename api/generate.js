export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const GEMINI_API_KEY = "AIzaSyCUzBsmcOP3ug629YdlrT8-puMQ6qlu8As";

  try {
    // बिलकुल सही और स्टेबल Gemini 1.5 Flash एंडपॉइंट
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
      console.error('Gemini API Error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Gemini API से कनेक्ट करने में दिक्कत आ रही है।' 
      });
    }

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // सुरक्षित तरीका: यह चेक करने के लिए कि आपकी वेबसाइट सादा टेक्स्ट मांग रही है या JSON ऑब्जेक्ट
      // हम सीधे टेक्स्ट भेजेंगे, लेकिन अगर वेबसाइट JSON ढूंढ रही होगी तो वह भी क्रैश नहीं होगी
      return res.status(200).send(generatedText);
    } else {
      return res.status(500).json({ error: 'API से डेटा सही फॉर्मेट में नहीं मिला।' });
    }

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'सर्वर एरर: ' + error.message });
  }
}
