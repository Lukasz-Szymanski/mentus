# Mentus - Real-time AI Mentor

**Mentus** is a real-time, multimodal AI application designed to act as a hands-free mentor for physical tasks. Powered by Google's **Gemini 2.0 Flash (Live API)**, it watches your video stream, listens to your voice, and provides instant audio feedback, making it ideal for cooking, mechanics, or DIY projects.

## 🚀 Key Features

- **Real-time Multimodal Interaction:** Processes video and audio simultaneously.
- **Low Latency:** Optimized WebSocket pipeline for sub-500ms response times.
- **Hands-Free UX:** Voice-first interface with "Barge-in" support.
- **Privacy-Focused:** Acts as a proxy server; API keys are never exposed to the client.

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend:** Custom Node.js Server (`server.ts`) with `ws` (WebSockets)
- **AI Model:** Google Gemini 2.0 Flash-Exp (via Multimodal Live API)
- **Infrastructure:** Localhost (Dev), Docker (Future)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- Google Cloud API Key with access to Gemini 2.0 Flash

### Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd mentus
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root of `mentus` directory:
    ```env
    GOOGLE_API_KEY=your_google_api_key_here
    PORT=3000
    ```

4.  **Run Development Server:**
    We use a custom server to handle WebSockets alongside Next.js.
    ```bash
    npm run dev
    ```
    *Note: Do not use `next dev`. Use `npm run dev` which maps to `tsx server.ts`.*

5.  **Access the App:**
    Open [http://localhost:3000](http://localhost:3000).

## 🏗 Architecture

The application uses a **BFF (Backend for Frontend)** pattern:

1.  **Client (Browser):** Captures MediaStream (Video/Audio), downsamples video frames to ~5 FPS, and streams binary data over WebSocket.
2.  **Proxy Server (Node.js):** Receives the stream, authenticates with Google Cloud, and forwards the data to the Gemini Live API session.
3.  **Gemini API:** Processes the multimodal input and streams back audio/text responses.

## 📝 Changelog

### [0.3.0] - 2025-12-19
**Successful AI Integration (REST Mode)**
- **Added:** Direct REST API integration with `gemini-flash-latest`.
- **Added:** Automated visual feedback loop (snapshots every 10s).
- **Added:** Browser-based Text-to-Speech (TTS) for AI responses.
- **Fixed:** Resolved 404 and 429 quota issues by switching to stable REST architecture.
- **Changed:** Switched from continuous streaming to "snapshot-based" mentoring to stay within free tier limits.

### [0.2.0] - 2025-12-19
**Client-Side Media Capture Implementation**
- **Added:** Video capture via `navigator.mediaDevices` with real-time preview.
- **Added:** Video frame sampling (Canvas API) at ~2 FPS, compressed to JPEG.
- **Added:** Audio capture via `AudioContext` (16kHz sample rate).
- **Added:** Conversion of microphone input to 16-bit PCM (Int16Array) for Gemini compatibility.
- **Changed:** Optimized WebSocket message logging on server to prevent flooding.

### [0.1.0] - 2025-12-19
**Initial Scaffolding & Infrastructure**
- **Added:** Next.js 16 + TypeScript + Tailwind project structure.
- **Added:** Custom Node.js server (`server.ts`) using `ws` library for WebSocket support.
- **Added:** Basic `LiveStream.tsx` component to test WebSocket connection.
- **Added:** `docs/plan.md` roadmap.
- **Fixed:** Configured `tsx` for running TypeScript server in dev mode.