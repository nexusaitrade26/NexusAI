import { useState } from 'react';
import Card from '../common/Card';

const ChartQuizClickable = ({ title, instruction, config }) => {
  const [feedback, setFeedback] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const candles = config?.candles || [];
  const targetIndex = config?.targetIndex ?? 2;

  const handleCandleClick = (idx) => {
    setSelectedIndex(idx);
    if (idx === targetIndex) {
      setFeedback({
        isCorrect: true,
        message: config?.correctFeedback || 'Esatto! Hai individuato l\'elemento corretto.'
      });
    } else {
      setFeedback({
        isCorrect: false,
        message: config?.wrongFeedback || 'Non corretto. Osserva attentamente il grafico e riprova.'
      });
    }
  };

  return (
    <Card className="border-purple-500/20 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-bold text-sm text-slate-100 font-outfit">{title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{instruction}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/30">
          Quiz Cliccabile
        </span>
      </div>

      {/* SVG Canvas per cliccare sulle candele */}
      <div className="w-full h-56 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between">
        <svg className="w-full h-full" viewBox="0 0 400 160">
          <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

          {candles.map((c, idx) => {
            const x = 50 + idx * 80;
            const isGreen = c.close >= c.open;
            const color = isGreen ? '#10b981' : '#f43f5e';
            const isSelected = selectedIndex === idx;

            const mapY = (val) => 150 - ((val - 110) / 60) * 120;
            const highY = mapY(c.high);
            const lowY = mapY(c.low);
            const openY = mapY(c.open);
            const closeY = mapY(c.close);
            const bodyY = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 4);

            return (
              <g
                key={idx}
                onClick={() => handleCandleClick(idx)}
                className="cursor-pointer group hover:opacity-80 transition-all"
              >
                {/* Evidenziatore al passaggio del mouse o se selezionato */}
                <rect
                  x={x - 10}
                  y="10"
                  width="44"
                  height="140"
                  fill={isSelected ? (idx === targetIndex ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)') : 'transparent'}
                  stroke={isSelected ? (idx === targetIndex ? '#10b981' : '#f43f5e') : 'transparent'}
                  strokeDasharray="2 2"
                  rx="6"
                />
                <line x1={x + 12} y1={highY} x2={x + 12} y2={lowY} stroke={color} strokeWidth="2" />
                <rect x={x} y={bodyY} width="24" height={bodyHeight} fill={color} rx="3" />
                <text x={x + 12} y="155" fill="#94a3b8" fontSize="9" textAnchor="middle">{c.time}</text>
              </g>
            );
          })}
        </svg>

        {/* Feedback Immediato */}
        {feedback && (
          <div className={`p-3 rounded-xl border text-xs font-medium ${
            feedback.isCorrect
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}>
            {feedback.isCorrect ? '✅ ' : '❌ '} {feedback.message}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChartQuizClickable;
