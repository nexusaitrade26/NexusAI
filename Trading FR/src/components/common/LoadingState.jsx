import Card from './Card';

const LoadingState = ({ lines = 3, className = '' }) => {
  return (
    <Card className={`space-y-4 animate-pulse ${className}`}>
      <div className="h-5 bg-slate-800/80 rounded-xl w-1/3"></div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, idx) => (
          <div key={idx} className="h-4 bg-slate-800/50 rounded-lg w-full"></div>
        ))}
      </div>
    </Card>
  );
};

export default LoadingState;
