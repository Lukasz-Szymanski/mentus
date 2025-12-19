'use client';

import { useEffect, useRef, useState } from 'react';

// Icons
const IconMicOn = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);
const IconMicOff = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);
const IconVideoOn = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
const IconVideoOff = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);
const IconEye = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const IconSoundWave = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22"></path><path d="M17 5v14"></path><path d="M22 9v6"></path><path d="M7 5v14"></path><path d="M2 9v6"></path></svg>
);

export default function LiveStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('System Ready.');
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // WebSocket removed
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // WebSocket connection code removed

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) setTranscript(prev => (prev + ' ' + currentTranscript).trim());
      };
      recognitionRef.current = recognition;
    }

    return () => { stopStreaming(); };
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsStreaming(true);
      setAudioEnabled(true);
      setVideoEnabled(true);
      if (recognitionRef.current) try { recognitionRef.current.start(); } catch (e) {}
      startSnapshotLoop();
    } catch (err: any) { alert(`Access Denied: ${err.message}`); }
  };

  const stopStreaming = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsStreaming(false);
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = !audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => t.enabled = !videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  const startSnapshotLoop = () => {
    intervalRef.current = setInterval(async () => {
      if (!canvasRef.current || !videoRef.current) return;
      
      const context = canvasRef.current.getContext('2d');
      if (context) {
        setIsAnalyzing(true);
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.5);
        const currentText = transcript; 
        setTranscript(''); // Clear buffer immediately

        try {
          const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData, text: currentText })
          });
          
          const data = await response.json();
          if (data.text) {
            setLastResponse(data.text);
            speak(data.text);
          }
        } catch (error) {
          console.error('API Error:', error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    }, 10000); 
  };

  const btnStyle = (active: boolean, red: boolean = false) => ({
    width: '64px', height: '64px', borderRadius: '50%', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    backgroundColor: red ? '#ff3b30' : (active ? 'rgba(255,255,255,0.1)' : '#ff3b30'),
    color: '#fff', transition: 'all 0.2s', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)'
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', width: '100vw', backgroundColor: '#000', color: '#fff', padding: '0px', fontFamily: '-apple-system, sans-serif'
    }}>
      
      <div style={{
        position: 'relative', width: '96vw', height: '92vh',
        backgroundColor: '#111', borderRadius: '48px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.9)'
      }}>
        
        <video
          ref={videoRef}
          autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isStreaming ? 1 : 0.2 }}
        />
        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />

        {/* Branding (Top Left Watermark) */}
        <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 40, pointerEvents: 'none' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-1.5px', opacity: 0.8 }}>Mentus</h1>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: '2px 0 0 0', textTransform: 'uppercase', letterSpacing: '2px' }}>Hands-Free Mentor</p>
        </div>

        {/* Status Indicators (Top Right) */}
        {isStreaming && (
            <div style={{ position: 'absolute', top: '40px', right: '40px', display: 'flex', gap: '12px', zIndex: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', border: isListening ? '1px solid #007aff' : '1px solid rgba(255,255,255,0.05)', color: '#fff' }}>
                    <div style={{ color: isListening ? '#007aff' : '#fff' }}><IconSoundWave /></div>
                    Listening
                </div>
                {isAnalyzing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', border: '1px solid #bf5af2' }}>
                        <div style={{ color: '#bf5af2' }}><IconEye /></div>
                        Analyzing
                    </div>
                )}
            </div>
        )}

        {!isStreaming && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <button
                    onClick={startStreaming}
                    style={{
                      padding: '24px 72px', fontSize: '1.5rem', fontWeight: 600,
                      backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '100px', cursor: 'pointer',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}
                >
                    Start Session
                </button>
            </div>
        )}

        {/* User Transcript (Centered Top) */}
        {transcript && isStreaming && (
            <div style={{
              position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 122, 255, 0.95)', padding: '16px 32px', borderRadius: '24px',
              maxWidth: '50%', fontSize: '1.2rem', backdropFilter: 'blur(20px)', zIndex: 30, color: '#fff', textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
                {transcript}
            </div>
        )}

        {/* AI Response Text (Floating Center Bubble) */}
        {isStreaming && (
            <div style={{
              position: 'absolute', bottom: '150px', left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: '1000px', textAlign: 'center', zIndex: 30, padding: '0 40px'
            }}>
                 <div style={{ 
                     backgroundColor: 'rgba(28, 28, 30, 0.85)', padding: '32px 48px', borderRadius: '40px',
                     fontSize: '1.8rem', color: '#fff', backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)',
                     boxShadow: '0 40px 80px rgba(0,0,0,0.7)', fontWeight: 500
                 }}>
                   {lastResponse}
                 </div>
            </div>
        )}

        {/* Controls Bar */}
        {isStreaming && (
            <div style={{
                position: 'absolute', bottom: '50px', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: '32px', zIndex: 50,
                padding: '16px 40px', borderRadius: '100px', backgroundColor: 'rgba(44, 44, 46, 0.6)',
                backdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <button onClick={toggleVideo} style={btnStyle(videoEnabled)}>
                    {videoEnabled ? <IconVideoOn /> : <IconVideoOff />}
                </button>
                <button onClick={toggleAudio} style={btnStyle(audioEnabled)}>
                    {audioEnabled ? <IconMicOn /> : <IconMicOff />}
                </button>
                <button onClick={stopStreaming} style={btnStyle(true, true)}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
