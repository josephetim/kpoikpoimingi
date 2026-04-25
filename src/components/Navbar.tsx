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
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-700 lg:hidden"
            onClick={onOpenMenu}
          >
            Menu
          </button>
          <Link to="/" className="flex-shrink-0" title="Go to Dashboard">
            <Logo size="md" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900">{pageTitle}</h1>
            <p className="text-xs text-slate-500">{formatDate(new Date().toISOString())}</p>
          </div>
        </div>

        <RoleSwitcher role={role} onChange={onRoleChange} />
      </div>
    </header>
  );
};

export default Navbar;
