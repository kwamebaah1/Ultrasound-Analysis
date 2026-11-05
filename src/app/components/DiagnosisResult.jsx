const STYLES = {
  Benign: { dot: 'bg-benign', text: 'text-benign', badge: 'bg-benign-soft text-benign border-green-200' },
  Malignant: { dot: 'bg-malignant', text: 'text-malignant', badge: 'bg-malignant-soft text-malignant border-red-200' },
};

const DiagnosisResult = ({ diagnosis, confidence }) => {
  const s = STYLES[diagnosis] ?? STYLES.Benign;

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Classification</p>
        <p className={`mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight ${s.text}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} aria-hidden />
          {diagnosis}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Model confidence</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
          {confidence.toFixed(1)}%
        </p>
      </div>
    </div>
  );
};

export default DiagnosisResult;
