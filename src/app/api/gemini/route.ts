import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_KEY = process.env.GOOGLE_API_KEY;
const MODEL_NAME = 'gemini-1.5-flash'; 

export async function POST(req: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    const { image, text } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Remove "data:image/jpeg;base64," prefix if present
    const base64Image = image.includes('base64,') ? image.split('base64,')[1] : image;

    const requestBody = {
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
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const result = await response.json();
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "I see you, but I'm not sure what to say.";

    return NextResponse.json({ text: textResponse });

  } catch (error: any) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
