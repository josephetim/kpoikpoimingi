import type { ReactNode } from 'react';
import { getStatusColor } from '../utils/getStatusColor';

interface BadgeProps {
  status: string;
  children?: ReactNode;
}

const Badge = ({ status, children }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(status)}`}
    >
      {children ?? status}
    </span>
  );
};

export default Badge;
