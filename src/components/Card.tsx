import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  value?: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const Card = ({ title, value, subtitle, action, children, className = '' }: CardProps) => {
  return (
    <div className={`min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-soft ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
          {title ? <h3 className="truncate text-sm font-semibold text-slate-600">{title}</h3> : <span />}
          {action}
        </div>
      )}

      {value ? <p className="text-2xl font-bold text-slate-900">{value}</p> : null}
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      {children}
    </div>
  );
};

export default Card;
