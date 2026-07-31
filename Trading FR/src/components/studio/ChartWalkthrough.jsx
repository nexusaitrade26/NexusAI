import { useState, useEffect } from 'react';
import Card from '../common/Card';

const ChartWalkthrough = ({ title, instruction, config }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2000); // 2 secondi per passo

  const candles = config?.candles || [];
  const steps = config?.steps || [];

  useEffect(() => {
    let timer;
    if (isPlaying && steps.length > 0) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, speed]);

  const activeStepObj = steps[currentStep] || { text: instruction };

  return (
    <Card className="border-blue-500/20 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-bold text-sm text-slate-100 font-outfit">{title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{instruction}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/30">
            Passo {currentStep + 1} di {steps.length || 1}
          </span>
        </div>
      </div>

      {/* SVG Interactive Candlestick Chart Canvas */}
      <div className="w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between">
        <svg className="w-full h-full" viewBox="0 0 400 180">
          {/* Griglia di Sfondo */}
          <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1="140" x2="400" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

          {/* Render Candele fino all'indice del passo corrente */}
          {candles.map((c, idx) => {
            const stepCandleCutoff = activeStepObj.candleIndex || (currentStep + 1);
            const isVisible = idx <= stepCandleCutoff;
            if (!isVisible) return null;

            const x = 40 + idx * 70;
            const isGreen = c.close >= c.open;
            const color = isGreen ? '#10b981' : '#f43f5e';
            
            // Mappatura prezzi -> coordinate Y SVG (range 110-170)
            const mapY = (val) => 170 - ((val - 110) / 60) * 140;
            
            const highY = mapY(c.high);
            const lowY = mapY(c.low);
            const openY = mapY(c.open);
            const closeY = mapY(c.close);
            const bodyY = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 4);

            return (
              <g key={idx} className="transition-all duration-300">
                {/* Wick */}
                <line x1={x + 12} y1={highY} x2={x + 12} y2={lowY} stroke={color} strokeWidth="2" />
                {/* Body */}
                <rect x={x} y={bodyY} width="24" height={bodyHeight} fill={color} rx="3" />
                <text x={x + 12} y="175" fill="#94a3b8" fontSize="9" textAnchor="middle">{c.time}</text>
              </g>
            );
          })}
        </svg>

        {/* Overlay Spiegazione Sincronizzata */}
        <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-blue-500/30 text-xs text-slate-200">
          <p className="leading-relaxed font-medium">{activeStepObj.text}</p>
        </div>
      </div>

      {/* Controlli Player (Play, Pausa, Precedente, Successivo, Velocità) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep((prev) => Math.max(prev - 1, 0));
            }}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-800"
          >
            &larr; Indietro
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold hover:bg-blue-600/30"
          >
            {isPlaying ? 'Pausa' : 'Play Animazione'}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
            }}
            disabled={currentStep >= steps.length - 1}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-800"
          >
            Avanti &rarr;
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Velocità:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs"
          >
            <option value={3000}>Lenta (3s)</option>
            <option value={2000}>Normale (2s)</option>
            <option value={1000}>Veloce (1s)</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

export default ChartWalkthrough;
