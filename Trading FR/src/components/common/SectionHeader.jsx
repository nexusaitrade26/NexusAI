const SectionHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${className}`}>
      <div>
        <h2 className="text-xl lg:text-2xl font-bold font-outfit text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default SectionHeader;
