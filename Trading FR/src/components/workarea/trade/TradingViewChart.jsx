import { useEffect, useRef, useState } from 'react';
import Card from '../../common/Card';
import { useMarket } from '../../../context/MarketContext';

const TradingViewChart = ({ symbol: propSymbol, onSymbolChange }) => {
  const { selectedAsset, setSelectedAsset } = useMarket();
  const symbol = propSymbol || selectedAsset;

  const containerRef = useRef(null);
  const [customInput, setCustomInput] = useState('');

  const quickAssets = [
    { id: 'BTC/USD', label: 'BTC' },
    { id: 'ETH/USD', label: 'ETH' },
    { id: 'NVDA', label: 'NVDA' },
    { id: 'AAPL', label: 'AAPL' },
    { id: 'TSLA', label: 'TSLA' },
    { id: 'EUR/USD', label: 'EUR/USD' },
    { id: 'GOLD', label: 'GOLD' },
    { id: 'OIL', label: 'OIL' },
  ];

  const mapSymbolToTradingView = (s) => {
    const clean = s.toUpperCase().trim();
    if (clean === 'BTC/USD' || clean === 'BTC') return 'BINANCE:BTCUSDT';
    if (clean === 'ETH/USD' || clean === 'ETH') return 'BINANCE:ETHUSDT';
    if (clean === 'NVDA') return 'NASDAQ:NVDA';
    if (clean === 'AAPL') return 'NASDAQ:AAPL';
    if (clean === 'TSLA') return 'NASDAQ:TSLA';
    if (clean === 'EUR/USD' || clean === 'EURUSD') return 'FX:EURUSD';
    if (clean === 'GOLD' || clean === 'XAUUSD') return 'OANDA:XAUUSD';
    if (clean === 'OIL' || clean === 'USOIL') return 'TVC:USOIL';
    return `NASDAQ:${clean}`;
  };

  const tvSymbol = mapSymbolToTradingView(symbol);

  const handleAssetSelect = (newSym) => {
    setCustomInput('');
    setSelectedAsset(newSym);
    if (onSymbolChange) {
      onSymbolChange(newSym);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const formatted = customInput.trim().toUpperCase();
    setSelectedAsset(formatted);
    if (onSymbolChange) {
      onSymbolChange(formatted);
    }
  };

  const loadedSymbolRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (loadedSymbolRef.current === tvSymbol && container.children.length > 0) {
      return;
    }
    loadedSymbolRef.current = tvSymbol;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: 'D',
      timezone: 'Europe/Rome',
      theme: 'dark',
      style: '1',
      locale: 'it',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com'
    });

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [tvSymbol]);

  return (
    <Card className="flex flex-col justify-between space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
            Grafico Live
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
            {symbol}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto max-w-full">
            {quickAssets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleAssetSelect(a.id)}
                className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all shrink-0 ${
                  symbol === a.id
                    ? 'bg-blue-600 text-white shadow-liquid-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleCustomSubmit} className="flex items-center gap-1 w-full sm:w-auto">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Cerca Asset..."
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 flex-1 sm:w-32 font-semibold"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold text-xs hover:bg-blue-600/30 shrink-0"
            >
              OK
            </button>
          </form>
        </div>
      </div>

      <div className="w-full h-[340px] sm:h-[440px] rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 relative">
        <div ref={containerRef} className="tradingview-widget-container w-full h-full" />
      </div>
    </Card>
  );
};

export default TradingViewChart;
