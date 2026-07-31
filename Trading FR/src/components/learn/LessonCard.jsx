import Card from '../common/Card';

/*
  LESSON CARD
  Componente per la singola card di micro-contenuto/lezione:
  - Titolo lezione
  - Durata stimata
  - Categoria
  - Pulsante di avvio/fruizione
*/

const LessonCard = ({ lesson, onSelectLesson }) => {
  if (!lesson) {
    return (
      <Card className="p-5 space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
            [Categoria Lezione]
          </span>
          <span>[Durata]</span>
        </div>
        <h4 className="font-bold text-sm text-slate-200 font-outfit">
          [Titolo Micro-Lezione]
        </h4>
        <div className="pt-2">
          <button
            onClick={onSelectLesson}
            className="w-full py-2 rounded-xl bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 text-xs font-semibold transition-all"
          >
            Inizia Lezione
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card hoverEffect className="p-5 flex flex-col justify-between space-y-3">
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-[10px]">
          {lesson.category}
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          {lesson.duration}
        </span>
      </div>

      <h4 className="font-bold text-sm text-slate-100 font-outfit leading-snug">
        {lesson.title}
      </h4>

      <div className="pt-2 border-t border-slate-800/80">
        <button
          onClick={() => onSelectLesson && onSelectLesson(lesson)}
          className="w-full py-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold transition-all"
        >
          Avvia Lezione
        </button>
      </div>
    </Card>
  );
};

export default LessonCard;
