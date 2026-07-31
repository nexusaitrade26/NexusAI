import { useTradingStore } from '../../store/useTradingStore';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const PortfolioOverview = () => {
  const balance = useTradingStore((state) => state.balance);
  const dailyPnL = 124.50; // Valore mock
  const dailyPnLPercent = 1.25; // Valore mock
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Capitale */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-slate-400 text-sm font-medium mb-2">Capitale Totale (Virtuale)</h3>
        <p className="text-3xl font-bold text-slate-50">€{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      
      {/* P&L */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-slate-400 text-sm font-medium mb-2">P&L Giornaliero</h3>
        <div className="flex items-center gap-2">
          <p className={`text-3xl font-bold ${dailyPnL >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {dailyPnL >= 0 ? '+' : '-'}€{Math.abs(dailyPnL).toFixed(2)}
          </p>
          <div className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${dailyPnL >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            {dailyPnL >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(dailyPnLPercent)}%
          </div>
        </div>
      </div>
      
      {/* Widget AI Market Overview */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={64} className="text-blue-500" />
        </div>
        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            AI Market Sentiment
          </h3>
          <p className="text-slate-50 text-sm">
            Il mercato azionario mostra una leggera tendenza 
            <span className="text-emerald-500 font-bold mx-1">Bullish</span> 
            dopo gli ultimi dati sull'inflazione. Si consiglia cautela nel settore tech.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
