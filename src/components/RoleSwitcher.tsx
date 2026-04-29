import type { Role } from '../types';
import { ROLES } from '../types';

interface RoleSwitcherProps {
  role: Role;
  onChange: (role: Role) => void;
  className?: string;
}

const RoleSwitcher = ({ role, onChange, className = '' }: RoleSwitcherProps) => {
  return (
    <div className={`flex min-w-0 flex-wrap items-center justify-start gap-2 sm:justify-end ${className}`}>
      <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-500 sm:block">
        Role
      </span>
      <select
        className="input-base w-full min-w-0 py-1.5 text-xs sm:min-w-[140px] sm:w-auto sm:text-sm"
        value={role}
        onChange={(event) => onChange(event.target.value as Role)}
      >
        {ROLES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSwitcher;
