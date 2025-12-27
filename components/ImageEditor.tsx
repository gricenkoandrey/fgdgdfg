
import React, { useState, useRef, useEffect } from 'react';

interface ImageEditorProps {
  image: string;
  onConfirm: (croppedImage: string) => void;
  onCancel: () => void;
  isScanning: boolean;
  mode: 'food' | 'body';
}

const statusMessages = {
  food: ["Загрузка FitVision AI...", "Сканирование объектов...", "Анализ состава...", "Сбор данных БЖУ..."],
  body: ["Биометрия активна...", "Поиск пропорций...", "Оценка рельефа...", "Формирование отчета..."]
};

export const ImageEditor: React.FC<ImageEditorProps> = ({ 
  image, 
  onConfirm, 
  onCancel, 
  isScanning,
  mode 
}) => {
  const [zoom, setZoom] = useState(1.1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [statusIdx, setStatusIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(0);
  const themeColorClass = mode === 'food' ? 'green' : 'purple';
  const themeHex = mode === 'food' ? '#22c55e' : '#a855f7';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let msgInterval: any;
    let progInterval: any;
    let timerInterval: any;
    
    if (isScanning) {
      setTimer(0);
      timerInterval = setInterval(() => setTimer(t => t + 1), 1000);

      msgInterval = setInterval(() => {
        setStatusIdx(prev => (prev < 3 ? prev + 1 : prev));
      }, 2500);
      
      progInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return prev;
          return prev + (Math.random() * 4);
        });
      }, 400);
    } else {
      if (progress > 0) setProgress(100);
    }
    
    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
      clearInterval(timerInterval);
    };
  }, [isScanning]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isScanning) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as any).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as any).clientY;
    setLastPos({ x: clientX, y: clientY });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isScanning) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as any).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as any).clientY;
    const dx = clientX - lastPos.x;
    const dy = clientY - lastPos.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastPos({ x: clientX, y: clientY });
  };

  const handleConfirm = () => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = image;
    img.onload = () => {
      const size = 640;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const containerWidth = containerRef.current?.clientWidth || 375;
        const containerHeight = containerRef.current?.clientHeight || 600;
        const imgRatio = img.width / img.height;
        const containerRatio = containerWidth / containerHeight;
        let drawWidth, drawHeight;
        if (imgRatio > containerRatio) {
          drawWidth = containerWidth;
          drawHeight = containerWidth / imgRatio;
        } else {
          drawHeight = containerHeight;
          drawWidth = containerHeight * imgRatio;
        }
        const currentWidth = drawWidth * zoom;
        const currentHeight = drawHeight * zoom;
        const scaleX = img.width / currentWidth;
        const scaleY = img.height / currentHeight;
        const frameSize = 300;
        const frameX = (containerWidth - frameSize) / 2;
        const frameY = (containerHeight - frameSize) / 2;
        const imgCenterX = containerWidth / 2 + offset.x;
        const imgCenterY = containerHeight / 2 + offset.y;
        const sourceX = (frameX - imgCenterX + currentWidth / 2) * scaleX;
        const sourceY = (frameY - imgCenterY + currentHeight / 2) * scaleY;
        const sourceW = frameSize * scaleX;
        const sourceH = frameSize * scaleY;
        ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, size, size);
        onConfirm(canvas.toDataURL('image/jpeg', 0.85));
      }
    };
  };

  return (
    <div className="fixed inset-0 z-[400] bg-black flex flex-col animate-in fade-in duration-300">
      <div className="p-8 pt-16 flex justify-between items-center text-white z-10">
        <button onClick={onCancel} className="w-12 h-12 glass rounded-2xl flex items-center justify-center active:scale-90 transition-all">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <h3 className="text-sm font-black uppercase tracking-[0.4em]">ADJUST SCAN</h3>
        <div className="w-12"></div>
      </div>

      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center bg-zinc-950 touch-none" 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <div className="w-full h-full flex items-center justify-center pointer-events-none" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}>
          <img src={image} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl" />
        </div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-80 h-80 border-2 border-white/20 rounded-[3rem] shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] relative">
             <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-full h-[1px] bg-white/20"></div>
                <div className="h-full w-[1px] bg-white/20 absolute"></div>
             </div>
             {/* Crop corners */}
             <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-3xl shadow-glow"></div>
             <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-3xl shadow-glow"></div>
             <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-3xl shadow-glow"></div>
             <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-3xl shadow-glow"></div>
          </div>
        </div>
      </div>

      <div className="glass p-10 pb-16 space-y-10 rounded-t-[3.5rem] border-t border-white/10 shadow-[0_-32px_64px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-6">
          <i className="fa-solid fa-minus text-white/30 text-xs"></i>
          <input type="range" min="0.5" max="3.5" step="0.01" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none accent-white" />
          <i className="fa-solid fa-plus text-white/30 text-xs"></i>
        </div>
        <button onClick={handleConfirm} disabled={isScanning} className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] text-white shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-5`} style={{ backgroundColor: themeHex }}>
          {isScanning ? <i className="fa-solid fa-spinner fa-spin"></i> : "ЗАПУСТИТЬ ИИ"}
        </button>
      </div>

      {/* Loading Overlay */}
      {isScanning && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl z-[500] flex flex-col items-center justify-center text-white p-12 animate-in fade-in duration-500 text-center">
           <div className="relative mb-16">
             <div className="w-40 h-40 border-[16px] border-white/[0.03] rounded-full"></div>
             <div className="absolute inset-0 w-40 h-40 border-[16px] border-t-transparent border-white/90 rounded-full animate-[spin_1.5s_linear_infinite]" style={{ borderTopColor: themeHex }}></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <i className={`fa-solid ${mode === 'food' ? 'fa-apple-whole' : 'fa-universal-access'} text-5xl animate-pulse`} style={{ color: themeHex }}></i>
             </div>
           </div>
           
           <div className="w-full max-w-sm space-y-5">
             <p className="text-4xl font-[900] uppercase tracking-tighter leading-tight">ОБРАБОТКА ДАННЫХ...</p>
             <div className="h-6 flex flex-col justify-center">
                <p className="text-white/40 text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-500">
                    {statusMessages[mode][statusIdx]}
                </p>
             </div>
             
             <div className="pt-4 space-y-3">
               <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, backgroundColor: themeHex }}></div>
               </div>
               <div className="flex justify-between items-center px-1">
                 <p className="text-[10px] font-bold text-white/20 tracking-widest uppercase">
                   ВРЕМЯ: {timer} СЕК.
                 </p>
                 <p className="text-[10px] font-bold text-white/20 tracking-widest uppercase">
                   {Math.round(progress)}%
                 </p>
               </div>
             </div>

             <button onClick={() => window.location.reload()} className="mt-12 text-[11px] font-black uppercase text-red-500/40 hover:text-red-500/80 transition-all border border-red-500/10 px-6 py-2 rounded-full">ОТМЕНА</button>
           </div>
        </div>
      )}

      <style>{`
        .shadow-glow {
          box-shadow: 0 0 15px rgba(255,255,255,0.4);
        }
      `}</style>
    </div>
  );
};
