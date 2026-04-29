import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../components/Card';
import Table from '../components/Table';
import { useContracts } from '../hooks/useContracts';
import { usePayments } from '../hooks/usePayments';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import type { ContractStatus, Role } from '../types';
import { getVisibleBranches } from '../utils/roleAccess';
import { getContractOutstanding } from '../utils/contractMetrics';

interface DashboardProps {
  role: Role;
}

const statusOrder: ContractStatus[] = [
  'Active',
  'Completed',
  'Defaulting',
  'Pending Approval',
];

const pieColors = ['#1a6b3c', '#9ca3af', '#ef4444', '#f59e0b'];
const assetTypeColors = ['#1a6b3c', '#f59e0b', '#0ea5e9'];

const Dashboard = ({ role }: DashboardProps) => {
  const contractsQuery = useContracts();
  const paymentsQuery = usePayments();
  const visibleBranches = getVisibleBranches(role);

  const contracts = contractsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];

  const scopedContracts = useMemo(
    () => contracts.filter((contract) => visibleBranches.includes(contract.branch)),
    [contracts, visibleBranches],
  );
  const scopedPayments = useMemo(
    () => payments.filter((payment) => visibleBranches.includes(payment.branch)),
    [payments, visibleBranches],
  );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const totalActiveContracts = scopedContracts.filter((contract) => contract.status === 'Active').length;
  const totalCollectionsThisMonth = scopedPayments
    .filter((payment) => {
      const paymentDate = new Date(payment.date);
      return paymentDate.getFullYear() === currentYear && paymentDate.getMonth() === currentMonth;
    })
    .reduce((sum, payment) => sum + payment.amount, 0);

  const outstandingBalance = scopedContracts.reduce(
    (sum, contract) => sum + getContractOutstanding(contract),
    0,
  );
  const overdueAccounts = scopedContracts.filter((contract) =>
    contract.schedule.some((schedule) => schedule.status === 'Overdue'),
  ).length;

  const monthlyCollectionsData = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(currentYear, currentMonth - (5 - index), 1);
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();

    const expected = scopedContracts.reduce((sum, contract) => {
      const contractExpected = contract.schedule
        .filter((entry) => {
          const due = new Date(entry.dueDate);
          return due.getFullYear() === year && due.getMonth() === month;
        })
        .reduce((entrySum, entry) => entrySum + entry.amountDue, 0);
      return sum + contractExpected;
    }, 0);

    const collected = scopedPayments
      .filter((payment) => {
        const date = new Date(payment.date);
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      month: monthDate.toLocaleString('en-NG', { month: 'short' }),
      expected,
      collected,
    };
  });

  const statusBreakdown = statusOrder.map((status) => ({
    name: status,
    value: scopedContracts.filter((contract) => contract.status === status).length,
  }));

  const assetTypeBreakdown = ['Vehicle', 'Electronics', 'Property'].map((assetType) => ({
    name: assetType,
    value: scopedContracts.filter((contract) => contract.category === assetType).length,
  }));

  const recentActivity = [...scopedPayments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const branchPerformance = visibleBranches.map((branch) => {
    const branchContracts = scopedContracts.filter((contract) => contract.branch === branch);
    const collected = scopedPayments
      .filter((payment) => {
        const date = new Date(payment.date);
        return (
          payment.branch === branch &&
          date.getFullYear() === currentYear &&
          date.getMonth() === currentMonth
        );
      })
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      branch,
      activeContracts: branchContracts.filter((contract) => contract.status === 'Active').length,
      collected,
      outstanding: branchContracts.reduce(
        (sum, contract) => sum + getContractOutstanding(contract),
        0,
      ),
    };
  });

  if (contractsQuery.isLoading || paymentsQuery.isLoading) {
    return <p className="rounded-lg bg-white p-4 text-sm text-slate-500">Loading dashboard data...</p>;
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Active Contracts" value={String(totalActiveContracts)} />
        <Card title="Total Collections This Month" value={formatCurrency(totalCollectionsThisMonth)} />
        <Card title="Outstanding Balance" value={formatCurrency(outstandingBalance)} />
        <Card title="Overdue Accounts" value={String(overdueAccounts)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Monthly Collections vs Expected" className="xl:col-span-2">
          <div className="h-64 sm:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCollectionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px', lineHeight: '18px' }} />
                <Bar dataKey="expected" fill="#f59e0b" name="Expected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" fill="#1a6b3c" name="Collected" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Contract Status Breakdown">
          <div className="h-64 sm:h-72 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px', lineHeight: '18px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Contracts by Asset Type">
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetTypeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {assetTypeBreakdown.map((entry, index) => (
                    <Cell key={`asset-${entry.name}`} fill={assetTypeColors[index % assetTypeColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Recent Activity" className="xl:col-span-1">
          <div className="space-y-3">
            {recentActivity.length ? (
              recentActivity.map((payment) => (
                <div key={payment.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-semibold text-slate-800">{payment.customerName}</p>
                  <p className="text-xs text-slate-500">{payment.contractId}</p>
                  <p className="mt-1 text-sm font-semibold text-brand-600">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-slate-500">{formatDate(payment.date)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No recent payments available.
              </p>
            )}
          </div>
        </Card>

        <div className="xl:col-span-2">
          <Table
            headers={['Branch', 'Active Contracts', 'Collected', 'Outstanding']}
            hasData={branchPerformance.length > 0}
            minWidthClassName="min-w-[640px]"
          >
            {branchPerformance.map((branch) => (
              <tr key={branch.branch}>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">{branch.branch}</td>
                <td className="whitespace-nowrap px-4 py-3">{branch.activeContracts}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatCurrency(branch.collected)}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatCurrency(branch.outstanding)}</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
