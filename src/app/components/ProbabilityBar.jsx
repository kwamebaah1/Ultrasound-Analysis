const TONES = {
  benign: 'bg-benign',
  malignant: 'bg-malignant',
};

const ProbabilityBar = ({ label, value, tone }) => {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-slate-700">{label}</span>
        <span className="font-medium tabular-nums text-slate-900">{value.toFixed(1)}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${label} probability`}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full ${TONES[tone] ?? 'bg-slate-500'} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProbabilityBar;
