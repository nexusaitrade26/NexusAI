import Card from './Card';

const EmptyState = ({ title, description, actionLabel, onAction, className = '' }) => {
  return (
    <Card className={`flex flex-col items-center justify-center text-center p-8 lg:p-12 border-dashed border-slate-800 ${className}`}>
      {/* Visual Placeholder Badge */}
      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
        <span className="w-3 h-3 rounded-full bg-blue-400/40"></span>
      </div>

      <h3 className="text-base lg:text-lg font-bold text-slate-200 font-outfit mb-2">
        {title}
      </h3>
      <p className="text-xs lg:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-2xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 font-semibold text-xs transition-all duration-200"
        >
          {actionLabel}
        </button>
      )}
    </Card>
  );
};

export default EmptyState;
