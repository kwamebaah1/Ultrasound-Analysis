const Panel = ({ title, step, actions, children, className = '' }) => (
  <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
    <header className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5">
      {step && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
          {step}
        </span>
      )}
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {actions && <div className="ml-auto flex items-center gap-1">{actions}</div>}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

export default Panel;
