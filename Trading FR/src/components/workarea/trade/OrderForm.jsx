import { useState, useEffect } from 'react';
import Card from '../../common/Card';
import { useMarket } from '../../../context/MarketContext';

const OrderForm = ({ onSubmitOrder, selectedAsset: propAsset, onAssetChange }) => {
  const { selectedAsset: contextAsset, setSelectedAsset, getLivePrice } = useMarket();

  const selectedAsset = propAsset || contextAsset;
  const livePrice = getLivePrice(selectedAsset);

  const [side, setSide] = useState('BUY'); // 'BUY' | 'SELL'
  const [lots, setLots] = useState('1.0');
  const [capital, setCapital] = useState('');
  const [lastEdited, setLastEdited] = useState('lots'); // 'lots' | 'capital'
  const [type, setType] = useState('market');

  const [stopLosses, setStopLosses] = useState(['']);
  const [takeProfits, setTakeProfits] = useState(['']);

  // Aggiornamento dinamico del capitale o lotti in TEMPO REALE al variare del prezzo live dell'asset
  useEffect(() => {
    if (lastEdited === 'lots') {
      if (lots && !isNaN(lots) && parseFloat(lots) > 0) {
        setCapital((parseFloat(lots) * livePrice).toFixed(2));
      }
    } else if (lastEdited === 'capital') {
      if (capital && !isNaN(capital) && parseFloat(capital) > 0) {
        setLots((parseFloat(capital) / livePrice).toFixed(4));
      }
    }
  }, [livePrice, selectedAsset, lastEdited, lots, capital]);

  const handleLotsInput = (val) => {
    setLastEdited('lots');
    setLots(val);
    if (!val || isNaN(val) || parseFloat(val) <= 0) {
      setCapital('');
      return;
    }
    setCapital((parseFloat(val) * livePrice).toFixed(2));
  };

  const handleCapitalInput = (val) => {
    setLastEdited('capital');
    setCapital(val);
    if (!val || isNaN(val) || parseFloat(val) <= 0) {
      setLots('');
      return;
    }
    setLots((parseFloat(val) / livePrice).toFixed(4));
  };

  const handleAddStopLoss = () => {
    setStopLosses([...stopLosses, '']);
  };

  const handleStopLossChange = (index, value) => {
    const updated = [...stopLosses];
    updated[index] = value;
    setStopLosses(updated);
  };

  const handleRemoveStopLoss = (index) => {
    if (stopLosses.length <= 1) return;
    setStopLosses(stopLosses.filter((_, idx) => idx !== index));
  };

  const handleAddTakeProfit = () => {
    setTakeProfits([...takeProfits, '']);
  };

  const handleTakeProfitChange = (index, value) => {
    const updated = [...takeProfits];
    updated[index] = value;
    setTakeProfits(updated);
  };

  const handleRemoveTakeProfit = (index) => {
    if (takeProfits.length <= 1) return;
    setTakeProfits(takeProfits.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAsset || !lots) return;

    const validSL = stopLosses.map(s => parseFloat(s)).filter(val => !isNaN(val));
    const validTP = takeProfits.map(t => parseFloat(t)).filter(val => !isNaN(val));

    onSubmitOrder({
      side,
      asset: selectedAsset,
      quantity: parseFloat(lots),
      type,
      stopLoss: validSL.length > 0 ? validSL[0] : null,
      stopLosses: validSL,
      takeProfit: validTP.length > 0 ? validTP[0] : null,
      takeProfits: validTP,
    });

    setLots('1.0');
    setLastEdited('lots');
    setStopLosses(['']);
    setTakeProfits(['']);
  };

  return (
    <Card className="border-blue-500/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-outfit">
            Inserisci nuovo ordine
          </h3>
          <p className="text-xs text-blue-400 font-medium mt-0.5">
            Asset selezionato: <strong className="text-white font-mono bg-blue-600/20 px-2 py-0.5 rounded-lg border border-blue-500/30">{selectedAsset}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-medium">Prezzo Live Grafico:</span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/30 animate-pulse">
            ${livePrice.toFixed(selectedAsset.includes('EUR') ? 4 : 2)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Selettore Operatività BUY (Rialzo / Long) vs SELL (Ribasso / Short) */}
        <div>
          <label className="block text-slate-400 font-medium mb-1.5">Direzione Operativa (Side)</label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`py-3 px-4 rounded-xl font-black font-outfit text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                side === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-liquid-glow border border-emerald-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              Acquista / BUY (Long)
            </button>

            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`py-3 px-4 rounded-xl font-black font-outfit text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                side === 'SELL'
                  ? 'bg-rose-600 text-white shadow-liquid-glow border border-rose-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-300 animate-pulse"></span>
              Vendi / SELL (Short)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-medium">Quantità (Lotti)</label>
              {lastEdited === 'lots' && (
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Sincronizzato Live</span>
              )}
            </div>
            <input
              type="number"
              step="any"
              min="0.0001"
              required
              value={lots}
              onChange={(e) => handleLotsInput(e.target.value)}
              placeholder="es. 1.0 lotto"
              className={`w-full bg-slate-900/80 border rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors font-mono font-bold ${
                lastEdited === 'lots' ? 'border-blue-500/80 ring-1 ring-blue-500/30' : 'border-slate-800'
              }`}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-400 font-medium">Oppure Capitale Investito ($)</label>
              {lastEdited === 'capital' && (
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">Sincronizzato Live</span>
              )}
            </div>
            <input
              type="number"
              step="any"
              min="1"
              value={capital}
              onChange={(e) => handleCapitalInput(e.target.value)}
              placeholder="es. $1000"
              className={`w-full bg-slate-900/80 border rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors font-mono font-bold ${
                lastEdited === 'capital' ? 'border-blue-500/80 ring-1 ring-blue-500/30' : 'border-slate-800'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Tipo Ordine</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors font-semibold"
            >
              <option value="market">Market (Mercato Immediato)</option>
              <option value="limit">Limit (Limite di Prezzo)</option>
            </select>
          </div>
        </div>

        {/* Sezione Stop Loss */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-semibold text-[11px]">Stop Loss</span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({side === 'BUY' ? 'Prezzo < Ingresso' : 'Prezzo > Ingresso'})
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddStopLoss}
              className="text-[10px] text-blue-400 font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20"
            >
              + Aggiungi Stop Loss (SL)
            </button>
          </div>

          {stopLosses.map((slVal, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 w-8">SL {index + 1}:</span>
              <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-blue-500">
                <button
                  type="button"
                  onClick={() => {
                    const val = parseFloat(slVal) || livePrice;
                    handleStopLossChange(index, Math.max(0, (val - 1)).toFixed(2));
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-blue-400 font-bold text-xs border-r border-slate-800 transition-colors"
                  title="Diminuisci SL di $1"
                >
                  -
                </button>
                <input
                  type="number"
                  step="any"
                  value={slVal}
                  onChange={(e) => handleStopLossChange(index, e.target.value)}
                  placeholder={`Prezzo SL ${index + 1}`}
                  className="flex-1 bg-transparent px-3 py-2 text-slate-200 focus:outline-none font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = parseFloat(slVal) || livePrice;
                    handleStopLossChange(index, (val + 1).toFixed(2));
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-blue-400 font-bold text-xs border-l border-slate-800 transition-colors"
                  title="Aumenta SL di $1"
                >
                  +
                </button>
              </div>
              {stopLosses.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStopLoss(index)}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold"
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Sezione Take Profit */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-semibold text-[11px]">Take Profit</span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({side === 'BUY' ? 'Prezzo > Ingresso' : 'Prezzo < Ingresso'})
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddTakeProfit}
              className="text-[10px] text-emerald-400 font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20"
            >
              + Aggiungi Take Profit (TP)
            </button>
          </div>

          {takeProfits.map((tpVal, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 w-8">TP {index + 1}:</span>
              <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-emerald-500">
                <button
                  type="button"
                  onClick={() => {
                    const val = parseFloat(tpVal) || livePrice;
                    handleTakeProfitChange(index, Math.max(0, (val - 1)).toFixed(2));
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs border-r border-slate-800 transition-colors"
                  title="Diminuisci TP di $1"
                >
                  -
                </button>
                <input
                  type="number"
                  step="any"
                  value={tpVal}
                  onChange={(e) => handleTakeProfitChange(index, e.target.value)}
                  placeholder={`Prezzo TP ${index + 1}`}
                  className="flex-1 bg-transparent px-3 py-2 text-slate-200 focus:outline-none font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = parseFloat(tpVal) || livePrice;
                    handleTakeProfitChange(index, (val + 1).toFixed(2));
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs border-l border-slate-800 transition-colors"
                  title="Aumenta TP di $1"
                >
                  +
                </button>
              </div>
              {takeProfits.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTakeProfit(index)}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold"
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-liquid-glow border ${
              side === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50'
                : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500/50'
            }`}
          >
            Conferma Ordine {side} ({lots} Lotti = ${capital || '0.00'} su {selectedAsset})
          </button>
        </div>
      </form>
    </Card>
  );
};

export default OrderForm;
