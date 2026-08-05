import { useState } from 'react';
import CapitalManagementView from '../components/capital/CapitalManagementView';
import StrategyAiView from '../components/capital/StrategyAiView';
import { useTradingStore } from '../store/useTradingStore';

const CapitalStrategyPage = ({ initialSubTab = 'gestione' }) => {
  const [subTab, setSubTab] = useState(initialSubTab);
  const isSubNavFixed = useTradingStore((state) => state.isSubNavFixed);

  const subNavItems = [
    { id: 'gestione', label: 'Gestione del Capitale' },
    { id: 'strategia', label: 'Strategia & Pianificatore AI' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Barra di Navigazione Superiore */}
      <div
        className={`transition-all duration-200 ${
          isSubNavFixed
            ? 'sticky top-0 z-30 py-2.5 mb-6 bg-[#060913]/95 backdrop-blur-md border-b border-slate-800/80 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-2xl'
            : 'relative pt-4 sm:pt-6 pb-2 mb-6'
        }`}
      >
        <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto no-scrollbar">
          {subNavItems.map((item) => {
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubTab(item.id)}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-liquid-glow border border-blue-500/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rendering delle due sotto-sezioni */}
      {subTab === 'gestione' && <CapitalManagementView />}
      {subTab === 'strategia' && <StrategyAiView />}
    </div>
  );
};

export default CapitalStrategyPage;
