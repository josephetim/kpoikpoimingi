import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ContractDetail from './pages/ContractDetail';
import Contracts from './pages/Contracts';
import CustomerProfile from './pages/CustomerProfile';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import type { Role } from './types';
import { canAccessPayments, canAccessReports } from './utils/roleAccess';

const SIDEBAR_COLLAPSE_KEY = 'kpo-sidebar-collapsed';

const App = () => {
  const [role, setRole] = useState<Role>('Staff');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const canAccessPaymentsPage = canAccessPayments(role);
  const canAccessReportsPage = canAccessReports(role);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    setIsSidebarCollapsed(storedValue === 'true');
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        canAccessPayments={canAccessPaymentsPage}
        canAccessReports={canAccessReportsPage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          role={role}
          onRoleChange={setRole}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard role={role} />} />
            <Route path="/contracts" element={<Contracts role={role} />} />
            <Route path="/contracts/:id" element={<ContractDetail role={role} />} />
            <Route path="/customers" element={<Customers role={role} />} />
            <Route path="/customers/:id" element={<CustomerProfile role={role} />} />
            <Route
              path="/payments"
              element={canAccessPaymentsPage ? <Payments /> : <Navigate to="/" replace />}
            />
            <Route
              path="/reports"
              element={canAccessReportsPage ? <Reports role={role} /> : <Navigate to="/" replace />}
            />
            <Route path="/settings" element={<Settings role={role} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
