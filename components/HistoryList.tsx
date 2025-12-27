
import React from 'react';
import { ScanResult } from '../types';

interface HistoryListProps {
  history: ScanResult[];
  onSelectResult: (result: ScanResult) => void;
  setView: (view: 'scan' | 'history') => void;
}

const translateCategory = (cat: string) => {
  switch (cat) {
    case 'food': return 'ЕДА';
    case 'body': return 'ТЕЛО';
    case 'beverage': return 'ПИТЬЕ';
    default: return 'ИНОЕ';
  }
};

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelectResult, setView }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-card">
        <div className="w-32 h-32 bg-white rounded-[3.5rem] shadow-xl flex items-center justify-center text-black/5 mb-10 rotate-12 border border-black/5">
          <i className="fa-solid fa-calendar-day text-6xl"></i>
        </div>
        <h3 className="text-2xl font-[900] tracking-tight text-[#1c1c1e] mb-3 uppercase">Архив пуст</h3>
        <p className="text-[11px] font-bold text-black/25 uppercase tracking-[0.3em] max-w-[240px] leading-relaxed mb-10">
          Ваша история преображения начнется здесь
        </p>
        <button 
          onClick={() => setView('scan')}
          className="bg-black text-white px-14 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
        >
          Начать
        </button>
      </div>
    );
  }

  // Группировка
  const grouped = history.reduce((acc, item) => {
    const dateStr = new Date(item.timestamp).toLocaleDateString('ru-RU', { 
      day: 'numeric', month: 'long'
    });
    if (!acc[dateStr]) acc[dateStr] = { items: [], totalCals: 0 };
    acc[dateStr].items.push(item);
    if (item.category === 'food' || item.category === 'beverage') {
      acc[dateStr].totalCals += (item.calories || 0);
    }
    return acc;
  }, {} as Record<string, { items: ScanResult[], totalCals: number }>);

  const totalScans = history.length;
  const avgCals = Math.round(history.reduce((a, b) => a + (b.calories || 0), 0) / (Object.keys(grouped).length || 1));

  return (
    <div className="py-2 space-y-8 pb-32 animate-card">
      {/* Total Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bento-card p-5 rounded-3xl bg-black text-white">
          <p className="text-[9px] font-black uppercase opacity-40 mb-1 tracking-widest">Всего сканов</p>
          <p className="text-2xl font-[900]">{totalScans}</p>
        </div>
        <div className="bento-card p-5 rounded-3xl">
          <p className="text-[9px] font-black uppercase text-black/30 mb-1 tracking-widest">Ср. за день</p>
          <p className="text-2xl font-[900] text-green-600">{avgCals} <span className="text-xs">ккал</span></p>
        </div>
      </div>

      {Object.entries(grouped).map(([date, group]) => (
        <div key={date} className="space-y-4">
          <div className="px-1 flex items-center justify-between sticky top-0 bg-[#F2F2F7]/80 backdrop-blur-md py-2 z-10">
            <div className="flex flex-col">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-black/30">{date}</h4>
              {group.totalCals > 0 && (
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                  Итого за день: {group.totalCals} ккал
                </p>
              )}
            </div>
            <div className="h-[1px] flex-1 bg-black/[0.05] ml-6"></div>
          </div>
          
          <div className="space-y-3">
            {group.items.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelectResult(item)}
                className="bento-card rounded-[2.2rem] p-3 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all bg-white"
              >
                <div className="w-16 h-16 rounded-[1.4rem] overflow-hidden shrink-0 shadow-md border border-black/5">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#1c1c1e] truncate uppercase text-[13px] tracking-tight mb-1">{item.name}</h4>
                  <div className="flex gap-2 items-center">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                      item.category === 'food' || item.category === 'beverage' ? 'bg-green-50 text-green-600' : 
                      item.category === 'body' ? 'bg-purple-50 text-purple-600' :
                      'bg-gray-50 text-black/30'
                    }`}>
                      {translateCategory(item.category)}
                    </span>
                    {(item.category === 'food' || item.category === 'beverage') && item.calories && (
                      <span className="text-[9px] font-bold text-black/40">{item.calories} ккал</span>
                    )}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-black/10">
                  <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
