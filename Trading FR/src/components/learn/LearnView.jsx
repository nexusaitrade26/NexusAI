import { useState, useEffect } from 'react';
import SectionHeader from '../common/SectionHeader';
import Card from '../common/Card';
import LoadingState from '../common/LoadingState';
import LessonView from '../studio/LessonView';
import { fetchApi } from '../../services/api';

const LearnView = () => {
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('base');
  const [categoryData, setCategoryData] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [isLoadingLevels, setIsLoadingLevels] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Carica i livelli con il progresso
  useEffect(() => {
    async function loadLevels() {
      setIsLoadingLevels(true);
      try {
        const res = await fetchApi('/studio/levels');
        setLevels(res.levels || []);
      } catch (err) {
        console.error('Errore caricamento livelli Studio:', err);
      } finally {
        setIsLoadingLevels(false);
      }
    }
    loadLevels();
  }, [selectedLessonId]);

  // Carica le categorie e lezioni per il livello selezionato
  useEffect(() => {
    async function loadCategories() {
      setIsLoadingCategories(true);
      try {
        const res = await fetchApi(`/studio/categories?level_code=${selectedLevel}`);
        setCategoryData(res);
      } catch (err) {
        console.error('Errore caricamento categorie Studio:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, [selectedLevel, selectedLessonId]);

  // Se è selezionata una lezione specifica, mostra la vista lezione
  if (selectedLessonId) {
    return (
      <LessonView
        lessonId={selectedLessonId}
        onBackToCategory={() => setSelectedLessonId(null)}
        onSelectLesson={(newId) => setSelectedLessonId(newId)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Studio"
        subtitle="Percorso formativo di trading completo: manuali approfonditi ed esercitazioni pratiche."
      />

      {/* Selettore dei 3 Livelli (Base, Intermedio, Avanzato) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoadingLevels ? (
          <LoadingState lines={2} />
        ) : (
          levels.map((lvl) => {
            const isSelected = selectedLevel === lvl.code;
            return (
              <Card
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.code)}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500/50 bg-blue-600/10 shadow-liquid-glow'
                    : 'hover:bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm text-slate-100 font-outfit">{lvl.name}</h3>
                  <span className="text-[11px] text-blue-400 font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                    {lvl.completedLessons} / {lvl.totalLessons} lezioni
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{lvl.description}</p>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500 shadow-liquid-glow"
                    style={{ width: `${lvl.progressPercent}%` }}
                  ></div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Elenco Categorie e Lezioni per Livello */}
      {isLoadingCategories ? (
        <LoadingState lines={5} />
      ) : !categoryData || !categoryData.categories || categoryData.categories.length === 0 ? (
        <Card className="p-8 text-center text-slate-400">
          Nessuna lezione disponibile per questo livello.
        </Card>
      ) : (
        <div className="space-y-6">
          {categoryData.categories.map((cat) => (
            <Card key={cat.id} className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-outfit">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {cat.lessons.length} lezioni
                </span>
              </div>

              {/* Lista delle Lezioni Intuitiva e Pulita (Nessun simbolo o emoji) */}
              <div className="space-y-2">
                {cat.lessons.map((les, idx) => (
                  <div
                    key={les.id}
                    onClick={() => setSelectedLessonId(les.id)}
                    className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-blue-400">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-100 font-outfit">
                          {les.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span>Durata: {les.duration}</span>
                          <span>-</span>
                          <span>Manuale guida incluso</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {les.completed ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                          Completata
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                          Inizia lezione
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearnView;
