import { Link, useLocation } from 'react-router-dom';
import RoleSwitcher from './RoleSwitcher';
import Logo from './Logo';
import type { Role } from '../types';
import { formatDate } from '../utils/formatDate';

interface NavbarProps {
  role: Role;
  onRoleChange: (role: Role) => void;
  onOpenMenu: () => void;
}

const titles: Record<string, string> = {
  '/': 'Dashboard Overview',
  '/contracts': 'Contracts',
  '/payments': 'Payments & Reconciliation',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/customers': 'Customers',
};

const Navbar = ({ role, onRoleChange, onOpenMenu }: NavbarProps) => {
  const location = useLocation();
  const pageTitle =
    titles[location.pathname] ||
    (location.pathname.startsWith('/contracts/') ? 'Contract Details' : 'Customer Profile');

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 lg:hidden"
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <Link to="/" className="min-w-0 max-w-[140px] shrink-0 sm:max-w-none" title="Go to Dashboard">
            <Logo size="md" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">{pageTitle}</h1>
            <p className="truncate text-xs text-slate-500">{formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        <RoleSwitcher role={role} onChange={onRoleChange} className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  );
};

export default Navbar;
