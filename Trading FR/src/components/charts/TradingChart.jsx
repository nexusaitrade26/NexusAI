import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Bot } from 'lucide-react';

const TradingChart = () => {
  const chartContainerRef = useRef();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Inizializza il grafico Lightweight Charts
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#1E293B' },
        textColor: '#94A3B8',
      },
      grid: {
        vertLines: { color: '#334155' },
        horzLines: { color: '#334155' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    // Dati mockati
    const data = [
      { time: '2023-01-01', open: 10, high: 12, low: 9, close: 11 },
      { time: '2023-01-02', open: 11, high: 13, low: 10, close: 12 },
      { time: '2023-01-03', open: 12, high: 15, low: 11, close: 14 },
      { time: '2023-01-04', open: 14, high: 14, low: 10, close: 10 },
      { time: '2023-01-05', open: 10, high: 11, low: 8, close: 9 },
      // ... idealmente qui si caricano i dati da un'API reale
    ];

    candlestickSeries.setData(data);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  const handleAiAnalysis = () => {
    setIsAnalyzing(true);
    // Simula chiamata API
    setTimeout(() => {
      setIsAnalyzing(false);
      alert('Analisi AI completata! (Guarda la console AI)');
    }, 1500);
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Header del grafico */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-50">AAPL / USD</h2>
          <p className="text-xs text-slate-400">Apple Inc. - 1D</p>
        </div>
        <button 
          onClick={handleAiAnalysis}
          disabled={isAnalyzing}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Bot size={18} />
          {isAnalyzing ? 'Analisi in corso...' : 'Analizza con AI'}
        </button>
      </div>
      
      {/* Contenitore Grafico */}
      <div ref={chartContainerRef} className="flex-1 w-full" />
    </div>
  );
};

export default TradingChart;
