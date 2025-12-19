# Mentus - AI Reality Companion

**Mentus** is a real-time, multimodal AI mentor designed to guide you through physical tasks. Powered by **Google Gemini 1.5 Flash**, it sees what you see, hears what you say, and provides instant audio-visual guidance.

Built for the **Google Gemini 3 Global Hackathon**.

![Status](https://img.shields.io/badge/Status-Beta_v3.0-success) ![Stack](https://img.shields.io/badge/Stack-Next.js_14_|_Node_|_Gemini_Flash-blue)

## ✨ Key Features

- **Vision:** Real-time analysis of your camera feed (snapshots every 10s).
- **Voice:** Understands your spoken questions via browser Speech Recognition.
- **Speech:** Replies to you with natural Text-to-Speech synthesis.
- **Design:** Premium, minimalist UI inspired by modern OS aesthetics.
- **Architecture:** Robust REST-based integration ensuring stability on all API tiers.

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS.
- **Backend:** Custom Node.js Server (`server.ts`) handling Multimodal Relay.
- **AI Model:** Google Gemini 1.5 Flash (via Direct REST API).
- **APIs:** WebSocket (Transport), Web Speech API (STT/TTS).

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google Cloud API Key (AI Studio)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd mentus
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:
    ```env
    GOOGLE_API_KEY=your_google_api_key_here
    PORT=3000
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    *Note: The custom server handles both Next.js pages and WebSocket connections.*

5.  **Open the App:**
    Navigate to [http://localhost:3000](http://localhost:3000). Allow camera/microphone access.

## 🏗 Architecture

**User Flow:**
1.  User starts a session; browser captures Video (Camera) and Audio (Microphone).
2.  **Speech-to-Text** runs locally in the browser to transcribe user questions.
3.  Every 10 seconds, a snapshot + transcript is sent via WebSocket to the Node.js server.
4.  Server constructs a multimodal prompt and calls **Gemini 1.5 Flash API**.
5.  AI response is sent back to the client and read aloud via **Text-to-Speech**.

## 📝 Changelog

### [0.4.0] - 2025-12-19
**UI Overhaul & Voice Interaction**
- **Added:** Browser-based Speech Recognition (STT) for user input.
- **Changed:** Complete UI Redesign (Modern Minimalist / Premium aesthetic).
- **Changed:** Switched to `gemini-flash-latest` for reliable multimodal analysis.
- **Fixed:** WebSocket stability improvements.

### [0.3.0] - 2025-12-19
**REST Architecture Migration**
- Switched from Gemini Live API (WebSocket) to REST API to resolve quota issues.
- Implemented snapshot-based analysis loop.

### [0.1.0] - 2025-12-19
**Initial Release**
- Project scaffolding and basic WebSocket setup.
