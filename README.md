# Mentus - Cinematic AI Reality Companion

**Mentus** is a futuristic, multimodal AI mentor designed for physical tasks. By combining computer vision with real-time speech recognition, it acts as a hands-free guide for cooking, DIY, mechanics, and more.

Built for the **Google Gemini 3 Global Hackathon**.

![Status](https://img.shields.io/badge/Status-Stable_v3.1-success) ![UI](https://img.shields.io/badge/UI-Cinematic_Glassmorphism-blueviolet)

---

## 🌟 Vision & Experience

Mentus provides an **Immersive AI Experience**. Instead of a traditional chat interface, it uses a cinematic, full-window camera feed overlaid with floating "glass" UI elements. 

- **Vision:** Gemini 1.5 Flash analyzes your surroundings through your camera.
- **Voice:** Speak naturally; Mentus transcribes your questions locally.
- **Speech:** Mentus replies using high-quality Text-to-Speech synthesis.

## 🛠 Features

- **Multimodal Feedback Loop:** Analyzes image snapshots + voice transcripts simultaneously.
- **Dynamic Status Island:** Visual indicators for "Listening" and "Analyzing" states.
- **Privacy-First:** Secure Node.js proxy handles API interactions.
- **Premium Design:** Minimalist aesthetics inspired by modern OS design (Apple/Tesla).
- **Control Bar:** Quick toggles for Camera and Microphone privacy.

## 🏗 Architecture

Mentus uses a **Hybrid Snapshot Architecture**:
1. **Client:** Captures media, runs local STT (Speech-to-Text), and renders the UI.
2. **Server (Proxy):** Relays multimodal data to Google's Generative AI servers.
3. **Brain:** Powered by **Gemini 1.5 Flash** for low-latency, high-accuracy reasoning.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google Cloud API Key (from AI Studio)

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

5.  **Access Mentus:**
    Open [http://localhost:3000](http://localhost:3000) and grant camera/mic permissions.

---

## 📝 Changelog

### [0.4.5] - 2025-12-19
**Cinematic Final Polish**
- **Added:** New Full-width Cinematic UI (95% viewport).
- **Added:** Visual status indicators (Listening/Analyzing badges).
- **Added:** Watermark branding and improved typography.
- **Fixed:** Cleaned up `page.tsx` and removed all legacy UI elements.

### [0.3.0] - 2025-12-19
**REST API Migration**
- Implemented robust REST-based multimodal loop using `gemini-1.5-flash`.

### [0.1.0] - 2025-12-19
**Initial Scaffolding**
- Project setup with Next.js and custom WebSocket server.