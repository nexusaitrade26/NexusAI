import { useState, useRef } from 'react';
import Card from '../common/Card';

const ChartDrawable = ({ title, instruction, config }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const svgRef = useRef(null);

  const candles = config?.candles || [];
  const targetY = config?.targetY || 140;
  const toleranceY = config?.toleranceY || 8;

  const getSVGCoordinates = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Converti in coordinate viewBox 400x180
    const x = ((clientX - rect.left) / rect.width) * 400;
    const y = ((clientY - rect.top) / rect.height) * 180;
    return { x, y };
  };

  const handleStart = (e) => {
    e.preventDefault();
    const coords = getSVGCoordinates(e);
    setStartPoint(coords);
    setEndPoint(coords);
    setIsDrawing(true);
    setFeedback(null);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getSVGCoordinates(e);
    setEndPoint(coords);
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (startPoint && endPoint) {
      // Mappatura coordinate Y disegnate rispetto al valore target del prezzo
      const mapYToPrice = (svgY) => 170 - ((svgY - 20) / 140) * 60;
      
      const avgY = (startPoint.y + endPoint.y) / 2;
      const drawnPriceY = mapYToPrice(avgY);

      const diff = Math.abs(drawnPriceY - targetY);

      if (diff <= toleranceY) {
        setFeedback({
          isCorrect: true,
          message: config?.correctFeedback || 'Ottimo lavoro! Hai tracciato correttamente la linea richiesta.'
        });
      } else {
        setFeedback({
          isCorrect: false,
          message: config?.wrongFeedback || 'Non del tutto preciso. Riprova a tracciare la linea sulla quota esatta.'
        });
      }
    }
  };

  return (
    <Card className="border-emerald-500/20 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h4 className="font-bold text-sm text-slate-100 font-outfit">{title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{instruction}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
          Grafico Disegnabile (Touch & Mouse)
        </span>
      </div>

      {/* SVG Interactive Drawing Canvas */}
      <div className="w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden select-none touch-none">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-crosshair"
          viewBox="0 0 400 180"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

          {/* Render Candele */}
          {candles.map((c, idx) => {
            const x = 50 + idx * 70;
            const isGreen = c.close >= c.open;
            const color = isGreen ? '#10b981' : '#f43f5e';

            const mapY = (val) => 170 - ((val - 110) / 60) * 140;
            const highY = mapY(c.high);
            const lowY = mapY(c.low);
            const openY = mapY(c.open);
            const closeY = mapY(c.close);
            const bodyY = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 4);

            return (
              <g key={idx}>
                <line x1={x + 12} y1={highY} x2={x + 12} y2={lowY} stroke={color} strokeWidth="2" />
                <rect x={x} y={bodyY} width="24" height={bodyHeight} fill={color} rx="3" />
                <text x={x + 12} y="175" fill="#94a3b8" fontSize="9" textAnchor="middle">{c.time}</text>
              </g>
            );
          })}

          {/* Linea Tracciata dall'utente */}
          {startPoint && endPoint && (
            <g>
              <line
                x1={startPoint.x}
                y1={startPoint.y}
                x2={endPoint.x}
                y2={endPoint.y}
                stroke="#38bdf8"
                strokeWidth="3"
                strokeDasharray="4 2"
              />
              <circle cx={startPoint.x} cy={startPoint.y} r="5" fill="#38bdf8" />
              <circle cx={endPoint.x} cy={endPoint.y} r="5" fill="#38bdf8" />
            </g>
          )}
        </svg>
      </div>

      {/* Controllo Reset & Feedback */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            setStartPoint(null);
            setEndPoint(null);
            setFeedback(null);
          }}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200"
        >
          Cancella Disegno
        </button>

        {feedback && (
          <div className={`px-4 py-2 rounded-xl border text-xs font-medium ${
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

export default ChartDrawable;
