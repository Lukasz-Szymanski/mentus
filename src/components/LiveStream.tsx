'use client';

import { useEffect, useRef, useState } from 'react';

export default function LiveStream() {
  const [status, setStatus] = useState<string>('Disconnected');
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('Waiting for AI...');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const wsUrl = `${protocol}://${host}/ws`;

    console.log(`Connecting to ${wsUrl}...`);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setStatus('Connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'text_response') {
          console.log('AI Response:', data.payload);
          setLastResponse(data.payload);
          // TODO: Add TTS here
          speak(data.payload);
        }
      } catch (e) {
        console.error('Error parsing server message', e);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected');
      setStatus('Disconnected');
      stopStreaming();
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      stopStreaming();
    };
  }, []);

  const speak = (text: string) => {
    // Simple browser TTS for now
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        // Audio temporarily disabled for stability test
        audio: false, 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);

      // Start Snapshot Loop (every 3 seconds)
      startSnapshotLoop();
    } catch (err: any) {
      console.error('Error accessing media devices:', err);
      alert(`Could not access camera. Error: ${err.name} - ${err.message}`);
    }
  };

  const stopStreaming = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  };

  const startSnapshotLoop = () => {
    intervalRef.current = setInterval(() => {
      if (!canvasRef.current || !videoRef.current || !wsRef.current) return;
      if (wsRef.current.readyState !== WebSocket.OPEN) return;

      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Quality 0.5 is fine for snapshots
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.5);
        
        wsRef.current.send(JSON.stringify({
          type: 'multimodal_chunk',
          payload: {
            image: imageData,
          }
        }));
      }
    }, 10000); // 10 seconds interval to stay within free tier limits
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 border rounded-2xl bg-white dark:bg-gray-950 shadow-xl w-full max-w-2xl">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-2xl font-bold tracking-tight">Mentus (v2 REST)</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium uppercase tracking-wider">{status}</span>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-800">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isStreaming ? 'opacity-100' : 'opacity-0'}`}
        />
        <canvas ref={canvasRef} width="640" height="480" className="hidden" />
        
        {/* Overlay for AI Response */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md p-4 rounded-lg text-white transition-opacity duration-300">
             <p className="text-sm font-mono text-blue-300 mb-1">AI MENTOR:</p>
             <p className="text-lg font-medium">{lastResponse}</p>
        </div>
      </div>

      <div className="flex gap-4">
        {!isStreaming ? (
          <button
            onClick={startStreaming}
            disabled={status !== 'Connected'}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-blue-500/25"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={stopStreaming}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-red-500/25"
          >
            Stop Session
          </button>
        )}
      </div>
    </div>
  );
}