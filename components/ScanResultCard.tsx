
import React from 'react';
import { ScanResult } from '../types';

interface ScanResultCardProps {
  result: ScanResult;
}

const translateNutrient = (key: string) => {
  switch (key) {
    case 'protein': return { label: 'Белки', icon: 'fa-egg', color: '#ef4444' };
    case 'carbs': return { label: 'Углеводы', icon: 'fa-bread-slice', color: '#f59e0b' };
    case 'fat': return { label: 'Жиры', icon: 'fa-droplet', color: '#3b82f6' };
    case 'sugar': return { label: 'Сахар', icon: 'fa-cubes-stacked', color: '#ec4899' };
    case 'fiber': return { label: 'Клетчатка', icon: 'fa-leaf', color: '#10b981' };
    default: return { label: key.toUpperCase(), icon: 'fa-circle-dot', color: '#6b7280' };
  }
};

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ result }) => {
  const isBody = result.category === 'body';
  const themeColor = isBody ? '#a855f7' : '#22c55e';
  const nutrientOrder = ['protein', 'fat', 'carbs', 'sugar', 'fiber'];

  const getReportText = () => {
    let text = `FitVision AI Report\n==================\n`;
    text += `Объект: ${result.name}\nДата: ${new Date(result.timestamp).toLocaleString()}\n\n`;
    if (isBody) {
      text += `СТАТУС: ${result.bodyMetrics?.status}\n`;
      text += `СИЛЬНЫЕ СТОРОНЫ: ${result.bodyMetrics?.strengths}\n`;
      text += `СЛАБЫЕ МЕСТА: ${result.bodyMetrics?.weaknesses}\n`;
      text += `ЧЕГО ИЗБЕГАТЬ: ${result.bodyMetrics?.missing}\n\n`;
      text += `РЕКОМЕНДАЦИИ:\n${result.bodyMetrics?.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n`;
    } else {
      text += `КАЛОРИИ: ${result.calories} ккал\n`;
      text += `ОПИСАНИЕ: ${result.description}\n\n`;
      text += `БЖУ:\n`;
      text += `Белки: ${result.nutrition?.protein}\n`;
      text += `Жиры: ${result.nutrition?.fat}\n`;
      text += `Углеводы: ${result.nutrition?.carbs}\n`;
    }
    return text;
  };

  const handleShare = async () => {
    const text = getReportText();
    if (navigator.share) {
      try {
        await navigator.share({ title: `FitVision: ${result.name}`, text });
      } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(text);
      alert('Скопировано в буфер!');
    }
  };

  const handleDownload = () => {
    const text = getReportText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FitVision_${result.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-card">
      <div className="relative rounded-[2.5rem] overflow-hidden bento-card border-none aspect-square shadow-2xl">
        <img src={result.imageUrl} alt={result.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
        
        <div className="absolute top-6 left-6 flex gap-3 z-20">
          <button onClick={handleShare} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white active:scale-90 shadow-2xl border border-white/20">
            <i className="fa-solid fa-arrow-up-from-bracket"></i>
          </button>
          <button onClick={handleDownload} className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-white active:scale-90 shadow-2xl border border-white/20">
            <i className="fa-solid fa-download"></i>
          </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="glass text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider shadow-lg">
              {isBody ? 'АНАТОМИЯ' : 'ПРОВЕРЕНО AI'}
            </span>
          </div>
          <h2 className="text-3xl font-[900] text-white leading-none uppercase tracking-tighter drop-shadow-md">
            {result.name}
          </h2>
        </div>
        {!isBody && result.calories !== undefined && (
          <div className="absolute top-6 right-6 bg-white rounded-2xl p-4 shadow-2xl text-center min-w-[100px] border border-black/5 rotate-2">
            <p className="text-2xl font-[900] leading-none tracking-tighter" style={{ color: themeColor }}>{result.calories}</p>
            <p className="text-[9px] font-black text-black/20 uppercase mt-1 tracking-widest">Ккал</p>
          </div>
        )}
      </div>

      <div className="bento-card p-6 rounded-[2.2rem] space-y-4">
        <div className="flex items-center gap-3 text-black/20">
          <div className="w-8 h-8 rounded-xl bg-black/[0.03] flex items-center justify-center">
            <i className={`fa-solid ${isBody ? 'fa-dna' : 'fa-calculator'} text-xs`}></i>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">{isBody ? 'Биометрия' : 'Расчет нутриентов'}</p>
        </div>
        
        <p className="text-[15px] font-bold text-black/80 leading-relaxed px-1">
          {isBody ? result.bodyMetrics?.status : result.description}
        </p>

        {!isBody && result.nutrition && (
          <div className="space-y-4 pt-4 border-t border-black/5">
            <div className="grid grid-cols-2 gap-3">
              {nutrientOrder.map((key) => {
                const value = (result.nutrition as any)?.[key];
                if (value === undefined || value === null) return null;
                const { label, icon, color } = translateNutrient(key);
                return (
                  <div key={key} className="bg-black/[0.02] p-4 rounded-2xl border border-black/[0.03] flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <i className={`fa-solid ${icon} text-[10px]`} style={{ color }}></i>
                      <p className="text-[9px] font-black text-black/30 uppercase tracking-widest">{label}</p>
                    </div>
                    <p className="text-xl font-[900] tracking-tight text-black/80">{value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isBody && result.bodyMetrics && (
          <div className="space-y-5 pt-4 border-t border-black/5">
            <div className="space-y-3">
              <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100/30">
                <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Что в норме</p>
                <p className="text-[14px] font-bold text-green-900/70">{result.bodyMetrics.strengths}</p>
              </div>
              <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100/30">
                <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Над чем работать</p>
                <p className="text-[14px] font-bold text-red-900/70">{result.bodyMetrics.weaknesses}</p>
              </div>
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/30">
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Что не нужно делать / Ошибки</p>
                <p className="text-[14px] font-bold text-amber-900/70">{result.bodyMetrics.missing}</p>
              </div>
            </div>

            {result.bodyMetrics.recommendations && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] ml-1">План действий</p>
                {result.bodyMetrics.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-[10px] font-black">
                      {i + 1}
                    </div>
                    <span className="text-[13px] font-bold text-black/70">{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
