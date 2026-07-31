const Card = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <div
      className={`glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-liquid-card relative overflow-hidden ${
        hoverEffect ? 'glass-panel-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
