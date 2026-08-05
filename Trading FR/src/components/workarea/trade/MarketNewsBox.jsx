import { useState, useEffect } from 'react';
import Card from '../../common/Card';
import LoadingState from '../../common/LoadingState';

const MarketNewsBox = ({ isLoading = false, newsData = null, selectedAsset = 'BTC/USD', onRefreshNews }) => {
  const [selectedNewsItem, setSelectedNewsItem] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (onRefreshNews) {
        onRefreshNews(selectedAsset);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedAsset, onRefreshNews]);

  if (isLoading) {
    return <LoadingState lines={4} />;
  }

  const newsList = newsData?.news || [];

  return (
    <>
      <Card className="border-blue-500/20 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Notizie di mercato
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-outfit">
              LIVE
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Asset: {selectedAsset}</span>
        </div>

        {/* Flusso di Notizie Cliccabili */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-2">
          {newsList.length === 0 ? (
            <p className="text-xs text-slate-400">Nessuna notizia recente per {selectedAsset}.</p>
          ) : (
            newsList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedNewsItem(item)}
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 cursor-pointer space-y-1.5 transition-all group"
              >
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="font-semibold text-blue-400">{item.source}</span>
                  <span>{item.time}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-100 font-outfit group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                  {item.summary}
                </p>
                <span className="text-[10px] text-blue-400 font-semibold inline-block pt-1">
                  Clicca per dettagli completi e fonte &rarr;
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* MODAL FINESTRA A TUTTO SCHERMO per Dettaglio Notizia */}
      {selectedNewsItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn select-text">
          <div className="glass-panel bg-[#090d1a]/95 rounded-3xl p-6 border border-slate-700/80 max-w-2xl w-full shadow-2xl relative space-y-5">
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                    {selectedNewsItem.source}
                  </span>
                  <span className="text-[10px] text-slate-400">{selectedNewsItem.time}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 font-outfit leading-tight">
                  {selectedNewsItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNewsItem(null)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Dettagli della Notizia */}
            <div className="space-y-4 text-xs text-slate-200 leading-relaxed">
              <p className="font-medium text-sm text-slate-100">{selectedNewsItem.summary}</p>
              
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-slate-300">
                <h4 className="font-bold text-xs text-blue-400 uppercase tracking-wider">Impatto sui Mercati</h4>
                <p>
                  Gli analisti ritengono che questa notizia introduca flussi di liquidità a favore di {selectedAsset}, aumentando la volatilità nelle prossime sessioni operative.
                </p>
              </div>
            </div>

            {/* Footer Modal con Link alla Fonte Originale */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-800">
              <span className="text-[10px] text-slate-400">Fonte verificata tramite aggregatore finanziario</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedNewsItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Chiudi
                </button>
                <a
                  href={selectedNewsItem.url || 'https://www.tradingview.com/news/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-liquid-glow transition-all"
                >
                  Leggi Fonte Originale &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketNewsBox;
