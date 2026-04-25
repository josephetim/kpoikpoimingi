import type { Role } from '../types';
import { ROLES } from '../types';

interface RoleSwitcherProps {
  role: Role;
  onChange: (role: Role) => void;
}

const RoleSwitcher = ({ role, onChange }: RoleSwitcherProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-500 sm:block">
        Role
      </span>
      <select
        className="input-base min-w-[140px] py-1.5 text-xs sm:text-sm"
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
