const WipPage = ({ title, description, progress = 75, features = [] }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-8 lg:p-12 border border-blue-500/20 shadow-liquid-card relative overflow-hidden">
        
        {/* Glowing background accent blob */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Status Badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
            Stato: In Lavorazione
          </div>
          <span className="text-xs text-slate-400 font-medium">Nexus AI Core v2.0</span>
        </div>

        {/* Main Title & Description */}
        <div className="space-y-4 mb-10">
          <h1 className="text-4xl lg:text-5xl font-black font-outfit text-white tracking-tight">
            {title}
          </h1>
          <p className="text-slate-300 text-base lg:text-lg max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3 mb-12 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-slate-300">Avanzamento Sviluppo Modulo</span>
            <span className="text-blue-400 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-liquid-glow"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Upcoming Features Preview */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Funzionalità in Fase di Rilascio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feat, idx) => (
              <div key={idx} className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
                  0{idx + 1}
                </div>
                <h4 className="font-bold text-sm text-slate-100">{feat.name}</h4>
                <p className="text-xs text-slate-400 leading-normal">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WipPage;
