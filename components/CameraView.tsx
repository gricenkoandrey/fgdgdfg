
import React, { useEffect } from 'react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCapture: () => void;
  onGalleryClick: () => void;
  onClose: () => void;
  isScanning: boolean;
  mode: 'food' | 'body';
}

export const CameraView: React.FC<CameraViewProps> = ({ 
  videoRef, 
  canvasRef, 
  onCapture, 
  onGalleryClick,
  onClose,
  isScanning,
  mode
}) => {
  const themeColor = mode === 'food' ? '#22c55e' : '#a855f7';

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error", err);
      }
    }
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [videoRef]);

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-between overflow-hidden">
      <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Bar */}
      <div className="safe-top w-full p-6 flex justify-between items-center z-10">
        <button onClick={onClose} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white active:scale-90 shadow-2xl">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
        <div className="glass px-5 py-2.5 rounded-2xl border border-white/20 shadow-xl">
          <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
            {mode === 'food' ? 'Скан Еды' : 'Анализ Тела'}
          </span>
        </div>
      </div>

      {/* Viewfinder */}
      <div className="relative w-72 h-72 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 border-2 border-white/20 rounded-[3rem] shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
        <div className="w-full h-[2px] opacity-80 blur-[1px] absolute top-0 animate-[scan_3s_infinite_ease-in-out]" style={{ backgroundColor: themeColor, boxShadow: `0 0 30px ${themeColor}` }}></div>
        
        {/* Corner markers */}
        <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-3xl shadow-lg"></div>
        <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-3xl shadow-lg"></div>
        <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-3xl shadow-lg"></div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-3xl shadow-lg"></div>
      </div>

      {/* Control Dock */}
      <div className="safe-bottom w-full p-10 pb-12 flex items-center justify-around z-10 bg-gradient-to-t from-black/80 to-transparent">
        <button onClick={onGalleryClick} className="w-16 h-16 glass rounded-full text-white flex items-center justify-center active:scale-90 shadow-xl border border-white/10">
          <i className="fa-solid fa-images text-xl"></i>
        </button>

        <button onClick={onCapture} disabled={isScanning} className="relative w-28 h-28 rounded-full border-4 border-white/30 flex items-center justify-center active:scale-95 p-1.5 transition-transform">
          <div className="w-full h-full rounded-full bg-white shadow-2xl flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-2 border-black/5 shadow-inner" style={{ backgroundColor: themeColor }}></div>
          </div>
          {isScanning && <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>}
        </button>

        <div className="w-16 h-16 bg-transparent"></div> {/* Spacer for symmetry */}
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(284px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
