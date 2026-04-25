const green =
  'bg-emerald-100 text-emerald-800 border border-emerald-200';
const red = 'bg-red-100 text-red-800 border border-red-200';
const gray = 'bg-slate-100 text-slate-700 border border-slate-200';
const yellow = 'bg-amber-100 text-amber-800 border border-amber-200';

export const getStatusColor = (status: string): string => {
  const normalized = status.toLowerCase();

  if (
    normalized === 'active' ||
    normalized === 'paid' ||
    normalized === 'success'
  ) {
    return green;
  }

  if (
    normalized === 'defaulting' ||
    normalized === 'overdue' ||
    normalized === 'failed'
  ) {
    return red;
  }

  if (normalized === 'completed') {
    return gray;
  }

  if (
    normalized === 'pending approval' ||
    normalized === 'pending' ||
    normalized === 'upcoming'
  ) {
    return yellow;
  }

  return gray;
};
