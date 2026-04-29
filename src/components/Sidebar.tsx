import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  canAccessPayments: boolean;
  canAccessReports: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface SidebarContentProps {
  canAccessPayments: boolean;
  canAccessReports: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
}

const iconClassName = 'h-5 w-5 flex-shrink-0';

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
    <path d="M4 13h7V4H4v9Zm0 7h7v-5H4v5Zm9 0h7V11h-7v9Zm0-18v7h7V2h-7Z" fill="currentColor" />
  </svg>
);

const ContractIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
    <path
      d="M6 3h9l5 5v13H6V3Zm8 1.5V9h4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 13h8M9 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CustomerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
    <path
      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 1 1 14 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PaymentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
    <path
      d="M3 7h18v10H3V7Zm14 0V5H7v2m5 3h5m-5 4h3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ReportIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
    <path
      d="M4 20h16M7 16V9m5 7V5m5 11v-4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
    <path
      d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.1a1 1 0 0 0-.9.6V15Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className={iconClassName} aria-hidden="true">
    <path
      d="M7 10V8a5 5 0 1 1 10 0v2m-9 0h8v10H8V10Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CollapseIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    {collapsed ? (
      <path
        d="m10 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="m14 6-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const navItemClasses =
  'group flex min-w-0 items-center rounded-lg py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200';

const activeNavItemClasses = 'bg-brand-500 text-white hover:bg-brand-600 hover:text-white';

const inactiveNavItemClasses = 'text-brand-50 hover:bg-brand-100 hover:text-brand-700';

const SidebarContent = ({
  canAccessPayments,
  canAccessReports,
  onClose,
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
}: SidebarContentProps) => {
  const showLabels = !isCollapsed || isMobile;
  const itemLayoutClasses = showLabels ? 'gap-3 px-3 justify-start' : 'justify-center px-2';

  return (
    <div className="flex h-full flex-col">
      <div
        className={`border-b border-brand-400/30 transition-all duration-300 ${
          showLabels ? 'px-4 py-5' : 'px-2 py-4'
        }`}
      >
        <div className={`flex items-center ${showLabels ? 'justify-between gap-3' : 'justify-center'}`}>
          {showLabels ? (
            <Link to="/" onClick={onClose} className="min-w-0 max-w-full" title="Go to Dashboard">
              <Logo size="lg" className="brightness-0 invert" />
            </Link>
          ) : (
            <Link
              to="/"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/50 p-1"
              title="Go to Dashboard"
            >
              <Logo size="sm" className="brightness-0 invert" />
            </Link>
          )}

          {!isMobile ? (
            <button
              type="button"
              className="rounded-md border border-brand-300/30 bg-brand-600/50 p-1.5 text-brand-50 transition hover:bg-brand-600"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <CollapseIcon collapsed={isCollapsed} />
            </button>
          ) : null}
        </div>

        {showLabels ? (
          <p className="mt-1 text-xs text-brand-200">Asset Financing Admin</p>
        ) : null}
      </div>

      <nav className={`min-w-0 flex-1 space-y-2 overflow-y-auto py-4 ${showLabels ? 'px-3' : 'px-2'}`}>
        <NavLink
          to="/"
          onClick={onClose}
          title="Dashboard"
          className={({ isActive }) =>
            `${navItemClasses} ${itemLayoutClasses} ${
              isActive ? activeNavItemClasses : inactiveNavItemClasses
            }`
          }
        >
          <DashboardIcon />
          {showLabels ? <span className="truncate">Dashboard</span> : null}
        </NavLink>

        <NavLink
          to="/customers"
          onClick={onClose}
          title="Customers"
          className={({ isActive }) =>
            `${navItemClasses} ${itemLayoutClasses} ${
              isActive ? activeNavItemClasses : inactiveNavItemClasses
            }`
          }
        >
          <CustomerIcon />
          {showLabels ? <span className="truncate">Customers</span> : null}
        </NavLink>

        <NavLink
          to="/contracts"
          onClick={onClose}
          title="Contracts"
          className={({ isActive }) =>
            `${navItemClasses} ${itemLayoutClasses} ${
              isActive ? activeNavItemClasses : inactiveNavItemClasses
            }`
          }
        >
          <ContractIcon />
          {showLabels ? <span className="truncate">Contracts</span> : null}
        </NavLink>

        {canAccessPayments ? (
          <NavLink
            to="/payments"
            onClick={onClose}
            title="Payments"
            className={({ isActive }) =>
              `${navItemClasses} ${itemLayoutClasses} ${
                isActive ? activeNavItemClasses : inactiveNavItemClasses
              }`
            }
          >
            <PaymentIcon />
            {showLabels ? <span className="truncate">Payments</span> : null}
          </NavLink>
        ) : showLabels ? (
          <div className="rounded-lg border border-brand-400/30 bg-brand-600/40 px-3 py-2 text-xs text-brand-100">
            Payments page is available only for Super Admin.
          </div>
        ) : (
          <div
            title="Payments page is available only for Super Admin."
            className="flex items-center justify-center rounded-lg border border-brand-400/30 bg-brand-600/40 py-2 text-brand-100"
          >
            <LockIcon />
          </div>
        )}

        {canAccessReports ? (
          <NavLink
            to="/reports"
            onClick={onClose}
            title="Reports"
            className={({ isActive }) =>
              `${navItemClasses} ${itemLayoutClasses} ${
                isActive ? activeNavItemClasses : inactiveNavItemClasses
              }`
            }
          >
            <ReportIcon />
            {showLabels ? <span className="truncate">Reports</span> : null}
          </NavLink>
        ) : showLabels ? (
          <div className="rounded-lg border border-brand-400/30 bg-brand-600/40 px-3 py-2 text-xs text-brand-100">
            Reports page is available only for Super Admin.
          </div>
        ) : (
          <div
            title="Reports page is available only for Super Admin."
            className="flex items-center justify-center rounded-lg border border-brand-400/30 bg-brand-600/40 py-2 text-brand-100"
          >
            <LockIcon />
          </div>
        )}

        <NavLink
          to="/settings"
          onClick={onClose}
          title="Settings"
          className={({ isActive }) =>
            `${navItemClasses} ${itemLayoutClasses} ${
              isActive ? activeNavItemClasses : inactiveNavItemClasses
            }`
          }
        >
          <SettingsIcon />
          {showLabels ? <span className="truncate">Settings</span> : null}
        </NavLink>
      </nav>
    </div>
  );
};

const Sidebar = ({
  isOpen,
  onClose,
  canAccessPayments,
  canAccessReports,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) => {
  return (
    <>
      <aside
        className={`hidden shrink-0 overflow-hidden border-r border-brand-400/30 bg-brand-700 transition-[width] duration-300 ease-in-out lg:flex lg:flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent
          canAccessPayments={canAccessPayments}
          canAccessReports={canAccessReports}
          onClose={onClose}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      <div className={`fixed inset-0 z-50 lg:hidden ${isOpen ? '' : 'pointer-events-none'}`}>
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
        <aside
          className={`relative h-full w-72 max-w-[85vw] border-r border-brand-400/30 bg-brand-700 shadow-xl transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent
            canAccessPayments={canAccessPayments}
            canAccessReports={canAccessReports}
            onClose={onClose}
            isCollapsed={false}
            onToggleCollapse={onToggleCollapse}
            isMobile
          />
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
