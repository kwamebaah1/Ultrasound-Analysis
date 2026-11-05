import { FiCheck } from 'react-icons/fi';

const LoadingIndicator = ({ steps, currentStep }) => {
  const current = Math.max(0, steps.indexOf(currentStep));

  return (
    <div className="py-4" aria-live="polite">
      <p className="mb-4 text-sm font-medium text-slate-900">Analysing image…</p>
      <ol className="space-y-2.5">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  done
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : active
                      ? 'border-brand-600'
                      : 'border-slate-200'
                }`}
              >
                {done ? (
                  <FiCheck size={12} aria-hidden />
                ) : active ? (
                  <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600" />
                ) : null}
              </span>
              <span className={done ? 'text-slate-500' : active ? 'font-medium text-slate-900' : 'text-slate-400'}>
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default LoadingIndicator;
