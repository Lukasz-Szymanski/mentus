import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);

const API_KEY = process.env.GOOGLE_API_KEY;
// Using the stable alias that should have a working free tier
const MODEL_NAME = 'gemini-flash-latest'; 

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws) => {
    console.log('Client connected to Mentus Server (v3 - Direct REST)');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'multimodal_chunk') {
          const { image, text } = data.payload;
          
          if (!image) return;

          // Remove "data:image/jpeg;base64," prefix
          const base64Image = image.split(',')[1]; 

          const requestBody = {
            contents: [{
              parts: [
                { text: `You are Mentus, an expert AI mentor. Use the provided video frame and the user's spoken input: "${text || 'No spoken input'}". Provide helpful, short guidance (max 2 sentences).` },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }]
          };

          console.log(`Sending REST request to ${MODEL_NAME}...`);

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini REST API Error (${response.status}):`, errorText);
            
            // Send error to client so user knows something is wrong
            ws.send(JSON.stringify({
              type: 'text_response',
              payload: `Error: ${response.status} - check server logs.`
            }));
            return;
          }

          const result = await response.json();
          // Safely extract text
          const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || "I see the image, but I'm not sure what to say.";
          
          console.log('Gemini Response:', textResponse);

          ws.send(JSON.stringify({
            type: 'text_response',
            payload: textResponse
          }));
        }

      } catch (err) {
        console.error('Error processing message:', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url!, true);

    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
