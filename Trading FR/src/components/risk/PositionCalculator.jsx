import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { useTradingStore } from '../../store/useTradingStore';

const PositionCalculator = () => {
  const balance = useTradingStore((state) => state.balance);
  const [riskPercent, setRiskPercent] = useState(1);
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  const riskAmount = balance * (riskPercent / 100);
  
  let positionSize = 0;
  let isLong = true;

  if (entryPrice && stopLoss) {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(stopLoss);
    
    if (entry > sl) {
      isLong = true;
      positionSize = riskAmount / (entry - sl);
    } else if (entry < sl) {
      isLong = false;
      positionSize = riskAmount / (sl - entry);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="text-emerald-500" />
        <h3 className="font-semibold text-slate-50">Risk Management & Position Sizing</h3>
      </div>
      
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Capitale Account (Simulato)</label>
          <div className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 opacity-70">
            €{balance.toFixed(2)}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Rischio (%) per Trade</label>
          <input
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">Stai rischiando: €{riskAmount.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Entry Price</label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Stop Loss</label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-50 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-700">
        <h4 className="text-xs text-slate-400 mb-2">Dimensione Posizione Consigliata</h4>
        {positionSize > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-50">
              {positionSize.toFixed(2)} <span className="text-sm font-normal text-slate-400">quote/azioni</span>
            </span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${isLong ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
              {isLong ? 'LONG (Compra)' : 'SHORT (Vendi)'}
            </span>
          </div>
        ) : (
          <span className="text-sm text-slate-500">Inserisci Entry e Stop Loss validi</span>
        )}
      </div>
    </div>
  );
};

export default PositionCalculator;
