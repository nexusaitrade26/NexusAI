const WorkAreaSubNav = ({ activeSubTab, setActiveSubTab }) => {
  const subNavItems = [
    { id: 'trade', label: 'Trade' },
    { id: 'portafolio', label: 'Portafolio' },
    { id: 'journal', label: 'Journal' },
  ];

  return (
    <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 w-fit select-none mb-6 font-sans shadow-sm">
      {subNavItems.map((item) => {
        const isActive = activeSubTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id)}
            className={`px-5 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
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
  );
};

export default WorkAreaSubNav;
