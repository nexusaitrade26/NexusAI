import { useTradingStore } from '../../store/useTradingStore';

const WorkAreaSubNav = ({ activeSubTab, setActiveSubTab }) => {
  const isSubNavFixed = useTradingStore((state) => state.isSubNavFixed);

  const subNavItems = [
    { id: 'trade', label: 'Trade' },
    { id: 'portafolio', label: 'Portafolio' },
    { id: 'journal', label: 'Journal' },
  ];

  return (
    <div
      className={`transition-all duration-200 ${
        isSubNavFixed
          ? 'sticky top-0 z-30 py-2.5 mb-6 bg-[#060913]/95 backdrop-blur-md border-b border-slate-800/80 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-2xl'
          : 'relative pt-4 sm:pt-6 pb-2 mb-6'
      }`}
    >
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 w-fit select-none font-sans shadow-xl">
        {subNavItems.map((item) => {
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id)}
              className={`px-5 py-2 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white border border-blue-500 shadow-liquid-glow'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkAreaSubNav;
