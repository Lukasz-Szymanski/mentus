import type { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = process.env.GOOGLE_API_KEY;
// Upgrading to the cutting-edge Gemini 2.5 Flash model
const MODEL_NAME = 'gemini-2.5-flash';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger payloads for images
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!API_KEY) {
      console.error('Missing API Key on server');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const { image, text } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Remove "data:image/jpeg;base64," prefix if present
    const base64Image = image.includes('base64,') ? image.split('base64,')[1] : image;

    console.log(`Sending request to Gemini (${MODEL_NAME})...`);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `You are Mentus, an expert AI mentor. Analyze this video frame and the user's spoken input: "${text || 'No spoken input'}". Provide helpful, short guidance (max 2 sentences).` },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const result = await response.json();
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "I see you, but I'm not sure what to say.";

    res.status(200).json({ text: textResponse });

  } catch (error: any) {
    console.error('Server Handler Error:', error);
    res.status(500).json({ error: error.message });
  }
}
