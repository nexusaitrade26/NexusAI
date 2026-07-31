import { useState, useEffect } from 'react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';
import LoadingState from '../common/LoadingState';
import ChartWalkthrough from './ChartWalkthrough';
import ChartQuizClickable from './ChartQuizClickable';
import ChartDrawable from './ChartDrawable';
import { fetchApi } from '../../services/api';

const LessonView = ({ lessonId, onBackToCategory, onSelectLesson }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'interactive'

  useEffect(() => {
    async function loadLesson() {
      setIsLoading(true);
      try {
        const res = await fetchApi(`/studio/lessons/${lessonId}`);
        setData(res);
        if (!res?.lesson?.manualText && res?.blocks?.length > 0) {
          setActiveTab('interactive');
        } else {
          setActiveTab('manual');
        }
      } catch (err) {
        console.error('Errore caricamento lezione:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (lessonId) loadLesson();
  }, [lessonId]);

  const handleToggleCompletion = async () => {
    if (!data?.lesson) return;
    setIsUpdatingProgress(true);
    const nextState = !data.lesson.completed;
    try {
      await fetchApi(`/studio/lessons/${data.lesson.id}/progress`, {
        method: 'POST',
        body: JSON.stringify({ completed: nextState }),
      });
      setData((prev) => ({
        ...prev,
        lesson: { ...prev.lesson, completed: nextState },
      }));
    } catch (err) {
      console.error('Errore aggiornamento progresso:', err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Quando si preme "Avanti", la lezione corrente viene contrassegnata AUTOMATICAMENTE come completata
  const handleNextLesson = async (nextId) => {
    if (data?.lesson && !data.lesson.completed) {
      try {
        await fetchApi(`/studio/lessons/${data.lesson.id}/progress`, {
          method: 'POST',
          body: JSON.stringify({ completed: true }),
        });
      } catch (err) {
        console.error('Errore durante il completamento automatico della lezione:', err);
      }
    }
    onSelectLesson(nextId);
  };

  if (isLoading) return <LoadingState lines={5} />;

  if (!data || !data.lesson) {
    return (
      <Card className="p-8 text-center text-slate-400">
        Lezione non trovata o non disponibile.
      </Card>
    );
  }

  const { lesson, blocks, navigation } = data;

  const cleanText = (text) => {
    if (!text) return '';
    return text.replace(/\*/g, '').replace(/#/g, '').trim();
  };

  return (
    <div className="space-y-6">
      {/* Header & Torna al Menu Lezioni */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBackToCategory}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5"
        >
          Indietro alle lezioni
        </button>

        <button
          onClick={handleToggleCompletion}
          disabled={isUpdatingProgress}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
            lesson.completed
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-blue-600/20 text-blue-400 border-blue-500/40 hover:bg-blue-600/30'
          }`}
        >
          {lesson.completed ? 'Lezione completata' : 'Segna come completata'}
        </button>
      </div>

      <SectionHeader
        title={lesson.title}
        subtitle={`Durata stimata: ${lesson.duration}`}
      />

      {/* Tab di Modalità PURE TESTO: "Manuale scritto e guida" e "Pratica" */}
      <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'manual'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-liquid-glow'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
        >
          Manuale scritto e guida
        </button>
        {blocks.length > 0 && (
          <button
            onClick={() => setActiveTab('interactive')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'interactive'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-liquid-glow'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            Pratica ({blocks.length})
          </button>
        )}
      </div>

      {/* MODALITÀ 1: Manuale Scritto */}
      {activeTab === 'manual' && (
        <Card className="border-blue-500/20 space-y-6">
          <div className="border-b border-slate-800/80 pb-3">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Panoramica introduttiva
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {cleanText(lesson.introText)}
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-200 leading-relaxed font-normal">
            {lesson.manualText ? (
              lesson.manualText.split('\n\n').map((paragraph, idx) => {
                const cleaned = cleanText(paragraph);
                if (!cleaned) return null;

                if (paragraph.startsWith('### ') || paragraph.startsWith('#### ')) {
                  return (
                    <h3 key={idx} className="text-sm font-bold text-slate-100 font-outfit pt-3 border-b border-slate-800/80 pb-1">
                      {cleaned}
                    </h3>
                  );
                }
                return (
                  <p key={idx} className="text-slate-300">
                    {cleaned}
                  </p>
                );
              })
            ) : (
              <p className="text-slate-400 font-italic">Nessun manuale scritto presente per questa lezione.</p>
            )}
          </div>
        </Card>
      )}

      {/* MODALITÀ 2: Pratica */}
      {activeTab === 'interactive' && (
        <div className="space-y-6">
          {blocks.map((block) => {
            if (block.type === 'chart_walkthrough') {
              return (
                <ChartWalkthrough
                  key={block.id}
                  title={block.title}
                  instruction={block.instruction}
                  config={block.config}
                />
              );
            }
            if (block.type === 'chart_quiz') {
              return (
                <ChartQuizClickable
                  key={block.id}
                  title={block.title}
                  instruction={block.instruction}
                  config={block.config}
                />
              );
            }
            if (block.type === 'chart_drawable') {
              return (
                <ChartDrawable
                  key={block.id}
                  title={block.title}
                  instruction={block.instruction}
                  config={block.config}
                />
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Navigazione Lezione Precedente / Successiva */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-800">
        {navigation.prev ? (
          <button
            onClick={() => onSelectLesson(navigation.prev.id)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            Indietro: {navigation.prev.title}
          </button>
        ) : <div />}

        {navigation.next ? (
          <button
            onClick={() => handleNextLesson(navigation.next.id)}
            className="px-4 py-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/30 transition-all"
          >
            Avanti: {navigation.next.title}
          </button>
        ) : <div />}
      </div>
    </div>
  );
};

export default LessonView;
