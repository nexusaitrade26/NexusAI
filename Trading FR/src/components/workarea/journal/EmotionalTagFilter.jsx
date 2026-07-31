import Card from '../../common/Card';

const EmotionalTagFilter = ({ filters = { tag: 'Tutti', result: 'Tutti i Risultati' }, onFilterChange }) => {
  const emotionalTags = ['Tutti', 'Calmo', 'Ansioso', 'FOMO', 'Vendetta'];
  const results = ['Tutti i Risultati', 'Win', 'Loss'];

  const currentTag = filters.tag || 'Tutti';
  const currentResult = filters.result || 'Tutti i Risultati';

  const handleTagClick = (tag) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, tag });
    }
  };

  const handleResultClick = (result) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, result });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filtro Tag Emotivo */}
        <div className="space-y-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Filtra per Tag Emotivo
          </span>
          <div className="flex flex-wrap gap-1.5">
            {emotionalTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentTag === tag
                    ? 'bg-blue-600 text-white shadow-liquid-glow'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro Risultato */}
        <div className="space-y-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Filtra per Risultato
          </span>
          <div className="flex flex-wrap gap-1.5">
            {results.map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => handleResultClick(res)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentResult === res
                    ? 'bg-blue-600 text-white shadow-liquid-glow'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmotionalTagFilter;
