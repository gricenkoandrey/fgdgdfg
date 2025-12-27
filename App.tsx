
import React, { useState, useRef, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { ScanResultCard } from './components/ScanResultCard';
import { HistoryList } from './components/HistoryList';
import { ImageEditor } from './components/ImageEditor';
import { analyzeImage } from './geminiService';
import { ScanResult } from './types';

const App: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'food' | 'body'>('food');
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [view, setView] = useState<'scan' | 'history'>('scan');
  const [errorType, setErrorType] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  useEffect(() => {
    // Загрузка истории при старте
    const saved = localStorage.getItem('scan_history_v2');
    if (saved) {
      try { 
        setHistory(JSON.parse(saved)); 
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  useEffect(() => {
    // Сохраняем последние 30 записей в историю
    const limitedHistory = history.slice(0, 30);
    localStorage.setItem('scan_history_v2', JSON.stringify(limitedHistory));
  }, [history]);

  const handleReset = () => {
    setCurrentResult(null);
    setErrorType(null);
    setPendingImage(null);
    setIsCameraActive(false);
    setIsScanning(false);
  };

  const handleNavScan = () => {
    setView('scan');
    if (!currentResult) {
      handleReset();
    }
  };

  const handleStartScan = (mode?: 'food' | 'body') => {
    if (mode) setScanMode(mode);
    handleReset();
    setIsCameraActive(true);
  };

  const processImage = async (base64WithHeader: string) => {
    const rawBase64 = base64WithHeader.split(',')[1];
    setIsScanning(true);
    setErrorType(null);

    try {
      const apiResult = await analyzeImage(rawBase64, scanMode);
      
      const newResult: ScanResult = {
        ...apiResult,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        imageUrl: base64WithHeader
      };
      
      setHistory(prev => [newResult, ...prev]);
      setCurrentResult(newResult);
      setIsCameraActive(false);
      setPendingImage(null);
    } catch (error: any) {
      console.error("Scan Error:", error);
      setErrorType('generic');
      setPendingImage(null);
    } finally {
      setIsScanning(false);
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeColor = scanMode === 'food' ? '#22c55e' : '#a855f7';

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-[#F2F2F7] overflow-hidden relative">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setPendingImage(ev.target?.result as string);
            setIsCameraActive(false);
          };
          reader.readAsDataURL(file);
        }
      }} />

      {/* Header */}
      <header className="safe-top glass z-[100] px-6 py-4 flex justify-between items-center border-b border-black/5 rounded-b-[2rem] shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-[900] tracking-tighter text-[#1c1c1e]">
            Fit<span style={{ color: themeColor }}>Vision</span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: themeColor }}></div>
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40">AI Health Engine Active</p>
          </div>
        </div>
        <button onClick={() => window.open('https://t.me/gricenkoandrey')} className="w-10 h-10 glass rounded-xl flex items-center justify-center text-black/40 active:scale-90 shadow-sm border border-black/5">
          <i className="fa-brands fa-telegram text-xl"></i>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto grid-bg px-5 pt-6 pb-40">
        {view === 'scan' ? (
          <div className="flex flex-col items-center min-h-full space-y-8">
            {!currentResult && !errorType && !pendingImage && (
              <div className="w-full flex flex-col items-center space-y-8 animate-card">
                <div className="w-full p-1 bg-black/[0.05] rounded-2xl flex shadow-inner border border-black/5">
                  <button 
                    onClick={() => setScanMode('food')}
                    className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${scanMode === 'food' ? 'bg-white shadow-md text-green-600' : 'text-black/30'}`}
                  >
                    Питание
                  </button>
                  <button 
                    onClick={() => setScanMode('body')}
                    className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${scanMode === 'body' ? 'bg-white shadow-md text-purple-600' : 'text-black/30'}`}
                  >
                    Фитнес
                  </button>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 blur-[60px] opacity-20 rounded-full" style={{ backgroundColor: themeColor }}></div>
                  <div className="w-48 h-48 bg-white rounded-[3.5rem] flex items-center justify-center shadow-xl relative border border-white">
                    <i className={`fa-solid ${scanMode === 'food' ? 'fa-bowl-rice' : 'fa-universal-access'} text-7xl`} style={{ color: themeColor }}></i>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-[900] text-[#1c1c1e] uppercase tracking-tight leading-none">
                    {scanMode === 'food' ? 'Анализ рациона' : 'Оценка формы'}
                  </h2>
                  <p className="text-xs font-semibold text-black/40 max-w-[200px] mx-auto">
                    {scanMode === 'food' ? 'Наведи камеру на еду для точного расчета КБЖУ' : 'Загрузи фото для анализа мышечного рельефа'}
                  </p>
                </div>

                <div className="w-full space-y-3 px-2">
                  <button 
                    onClick={() => handleStartScan()}
                    className="w-full py-5 rounded-[1.8rem] text-white font-black text-lg shadow-xl active:scale-95 flex items-center justify-center gap-3 transition-all"
                    style={{ backgroundColor: themeColor }}
                  >
                    <i className="fa-solid fa-camera"></i>
                    Сканировать
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 rounded-[1.8rem] bg-white border border-black/5 font-bold text-black/50 text-sm active:scale-95 shadow-sm"
                  >
                    Выбрать из галереи
                  </button>
                </div>
              </div>
            )}

            {currentResult && (
              <div className="w-full animate-card">
                <ScanResultCard result={currentResult} />
                <button onClick={handleReset} className="w-full mt-6 py-4 rounded-[1.8rem] bg-black text-white font-black text-sm uppercase tracking-widest active:scale-95 shadow-lg">
                  К новому скану
                </button>
              </div>
            )}
            
            {errorType && (
              <div className="w-full bento-card p-10 rounded-[2.5rem] text-center space-y-5 animate-card border-red-50">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                  <i className="fa-solid fa-circle-exclamation text-3xl text-red-500"></i>
                </div>
                <h3 className="text-xl font-[900]">Ошибка анализа</h3>
                <p className="text-sm font-semibold text-black/40 leading-relaxed">Попробуйте сделать фото более четким или с другого ракурса.</p>
                <button onClick={handleReset} className="w-full py-4 rounded-2xl bg-black text-white font-black active:scale-95">Попробовать еще раз</button>
              </div>
            )}
          </div>
        ) : (
          <HistoryList history={history} onSelectResult={(res) => { setCurrentResult(res); setView('scan'); }} setView={setView} />
        )}
      </main>

      {/* Navigation */}
      <nav className="safe-bottom fixed bottom-8 left-8 right-8 h-20 glass rounded-[2.5rem] flex items-center justify-around px-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 z-[150]">
        <button 
          onClick={handleNavScan}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'scan' ? 'scale-110' : 'opacity-20 hover:opacity-40'}`}
          style={{ color: view === 'scan' ? themeColor : '#000' }}
        >
          <i className="fa-solid fa-expand text-2xl"></i>
          <span className="text-[10px] font-black uppercase tracking-tighter">Скан</span>
        </button>
        <button 
          onClick={() => setView('history')}
          className={`flex-1 flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'history' ? 'scale-110' : 'opacity-20 hover:opacity-40'}`}
          style={{ color: view === 'history' ? themeColor : '#000' }}
        >
          <i className="fa-solid fa-list-ul text-2xl"></i>
          <span className="text-[10px] font-black uppercase tracking-tighter">Архив</span>
        </button>
      </nav>

      {/* Overlays */}
      {isCameraActive && !pendingImage && (
        <CameraView 
          videoRef={videoRef} 
          canvasRef={canvasRef} 
          onCapture={() => {
            if (videoRef.current && canvasRef.current) {
              const canvas = canvasRef.current;
              const video = videoRef.current;
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              canvas.getContext('2d')?.drawImage(video, 0, 0);
              setPendingImage(canvas.toDataURL('image/jpeg', 0.85));
            }
          }} 
          onGalleryClick={() => fileInputRef.current?.click()} 
          onClose={() => setIsCameraActive(false)} 
          isScanning={isScanning} 
          mode={scanMode} 
        />
      )}

      {pendingImage && (
        <ImageEditor 
          image={pendingImage} 
          onConfirm={processImage} 
          onCancel={() => setPendingImage(null)} 
          isScanning={isScanning} 
          mode={scanMode} 
        />
      )}
    </div>
  );
};

export default App;
