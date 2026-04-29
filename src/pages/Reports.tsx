import { useMemo, useState } from 'react';
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
import { BRANCHES, CONTRACT_STATUSES, ITEM_CATEGORIES, type Role } from '../types';
import { csvExport } from '../utils/csvExport';
import { getContractOutstanding, getMonthBoundaries, isDateWithinRange } from '../utils/contractMetrics';
import { formatCurrency } from '../utils/formatCurrency';
import { getVisibleBranches } from '../utils/roleAccess';

interface ReportsProps {
  role: Role;
}

const statusColors = ['#1a6b3c', '#94a3b8', '#ef4444', '#f59e0b'];
const assetTypeColors = ['#0ea5e9', '#f59e0b', '#1a6b3c'];

const Reports = ({ role }: ReportsProps) => {
  const contractsQuery = useContracts();
  const paymentsQuery = usePayments();
  const visibleBranches = getVisibleBranches(role);
  const monthBoundaries = getMonthBoundaries();

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<'All' | (typeof BRANCHES)[number]>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | (typeof CONTRACT_STATUSES)[number]>('All');
  const [assetTypeFilter, setAssetTypeFilter] = useState<'All' | (typeof ITEM_CATEGORIES)[number]>('All');
  const [startDate, setStartDate] = useState(monthBoundaries.firstDay);
  const [endDate, setEndDate] = useState(monthBoundaries.lastDay);

  const scopedContracts = (contractsQuery.data ?? []).filter((contract) =>
    visibleBranches.includes(contract.branch),
  );
  const scopedPayments = (paymentsQuery.data ?? []).filter((payment) =>
    visibleBranches.includes(payment.branch),
  );

  const filteredContracts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return scopedContracts.filter((contract) => {
      const matchesSearch =
        !normalizedSearch ||
        contract.id.toLowerCase().includes(normalizedSearch) ||
        contract.customerName.toLowerCase().includes(normalizedSearch) ||
        contract.item.toLowerCase().includes(normalizedSearch);
      const matchesBranch = branchFilter === 'All' || contract.branch === branchFilter;
      const matchesStatus = statusFilter === 'All' || contract.status === statusFilter;
      const matchesAssetType = assetTypeFilter === 'All' || contract.category === assetTypeFilter;
      const matchesDate = isDateWithinRange(contract.startDate, startDate || undefined, endDate || undefined);

      return matchesSearch && matchesBranch && matchesStatus && matchesAssetType && matchesDate;
    });
  }, [assetTypeFilter, branchFilter, endDate, scopedContracts, searchTerm, startDate, statusFilter]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return scopedPayments.filter((payment) => {
      const matchesSearch =
        !normalizedSearch ||
        payment.customerName.toLowerCase().includes(normalizedSearch) ||
        payment.contractId.toLowerCase().includes(normalizedSearch) ||
        payment.reference.toLowerCase().includes(normalizedSearch);
      const matchesBranch = branchFilter === 'All' || payment.branch === branchFilter;
      const matchesDate = isDateWithinRange(payment.date, startDate || undefined, endDate || undefined);

      return matchesSearch && matchesBranch && matchesDate;
    });
  }, [branchFilter, endDate, scopedPayments, searchTerm, startDate]);

  const branchesInScope = BRANCHES.filter((branch) => visibleBranches.includes(branch)).filter((branch) =>
    branchFilter === 'All' ? true : branch === branchFilter,
  );

  const totalOutstanding = filteredContracts.reduce(
    (sum, contract) => sum + getContractOutstanding(contract),
    0,
  );

  const statusSummary = CONTRACT_STATUSES.map((status) => ({
    status,
    count: filteredContracts.filter((contract) => contract.status === status).length,
  }));

  const collectionsByBranch = branchesInScope.map((branch) => ({
    branch,
    value: filteredPayments
      .filter((payment) => payment.branch === branch)
      .reduce((sum, payment) => sum + payment.amount, 0),
  }));

  const outstandingByBranch = branchesInScope.map((branch) => ({
    branch,
    value: filteredContracts
      .filter((contract) => contract.branch === branch)
      .reduce((sum, contract) => sum + getContractOutstanding(contract), 0),
  }));

  const assetTypeSummary = ITEM_CATEGORIES.map((assetType) => ({
    assetType,
    count: filteredContracts.filter((contract) => contract.category === assetType).length,
  }));

  const overdueSummary = filteredContracts
    .map((contract) => ({
      contractId: contract.id,
      customerName: contract.customerName,
      branch: contract.branch,
      overdueInstallments: contract.schedule.filter((schedule) => schedule.status === 'Overdue').length,
      overdueAmount: contract.schedule
        .filter((schedule) => schedule.status === 'Overdue')
        .reduce((sum, schedule) => sum + (schedule.amountDue - schedule.amountPaid), 0),
    }))
    .filter((row) => row.overdueInstallments > 0)
    .sort((a, b) => b.overdueAmount - a.overdueAmount);

  const resetFilters = () => {
    setSearchTerm('');
    setBranchFilter('All');
    setStatusFilter('All');
    setAssetTypeFilter('All');
    setStartDate(monthBoundaries.firstDay);
    setEndDate(monthBoundaries.lastDay);
  };

  const exportSummaryCsv = () => {
    csvExport(
      [
        ...statusSummary.map((row) => ({
          Section: 'Contracts by Status',
          Metric: row.status,
          Value: row.count,
        })),
        ...collectionsByBranch.map((row) => ({
          Section: 'Collections by Branch',
          Metric: row.branch,
          Value: row.value,
        })),
        ...outstandingByBranch.map((row) => ({
          Section: 'Outstanding by Branch',
          Metric: row.branch,
          Value: row.value,
        })),
        ...assetTypeSummary.map((row) => ({
          Section: 'Contracts by Asset Type',
          Metric: row.assetType,
          Value: row.count,
        })),
        {
          Section: 'Overdue Contracts',
          Metric: 'Total Overdue Contracts',
          Value: overdueSummary.length,
        },
      ],
      'kpoikpoimingi-reports-summary.csv',
    );
  };

  if (contractsQuery.isLoading || paymentsQuery.isLoading) {
    return <p className="rounded-lg bg-white p-4 text-sm text-slate-500">Loading reports...</p>;
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Filter report metrics by scope, status, category, and date range.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={resetFilters}>
              Reset Filters
            </button>
            <button type="button" className="btn-secondary w-full sm:w-auto" onClick={exportSummaryCsv}>
              Export Summary CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="min-w-0 sm:col-span-2 lg:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Search
            </label>
            <input
              type="text"
              className="input-base w-full min-w-0"
              value={searchTerm}
              placeholder="Customer, contract, item, or reference"
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Branch
            </label>
            <select
              className="input-base w-full min-w-0"
              value={branchFilter}
              onChange={(event) => setBranchFilter(event.target.value as typeof branchFilter)}
            >
              <option value="All">All Branches</option>
              {BRANCHES.filter((branch) => visibleBranches.includes(branch)).map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Status
            </label>
            <select
              className="input-base w-full min-w-0"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            >
              <option value="All">All Statuses</option>
              {CONTRACT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Asset Type
            </label>
            <select
              className="input-base w-full min-w-0"
              value={assetTypeFilter}
              onChange={(event) => setAssetTypeFilter(event.target.value as typeof assetTypeFilter)}
            >
              <option value="All">All Asset Types</option>
              {ITEM_CATEGORIES.map((assetType) => (
                <option key={assetType} value={assetType}>
                  {assetType}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              From
            </label>
            <input
              type="date"
              className="input-base w-full min-w-0"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              To
            </label>
            <input
              type="date"
              className="input-base w-full min-w-0"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Contracts" value={String(filteredContracts.length)} />
        <Card title="Total Outstanding Balance" value={formatCurrency(totalOutstanding)} />
        <Card
          title="Total Collections"
          value={formatCurrency(filteredPayments.reduce((sum, payment) => sum + payment.amount, 0))}
        />
        <Card title="Overdue Contracts" value={String(overdueSummary.length)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Total Contracts by Status">
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusSummary} dataKey="count" nameKey="status" outerRadius={100} innerRadius={60}>
                  {statusSummary.map((entry, index) => (
                    <Cell key={entry.status} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px', lineHeight: '18px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Collections by Branch" className="xl:col-span-2">
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionsByBranch}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Bar dataKey="value" fill="#1a6b3c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Outstanding Balance by Branch">
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outstandingByBranch}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Contracts by Asset Type">
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetTypeSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="assetType" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {assetTypeSummary.map((entry, index) => (
                    <Cell key={entry.assetType} fill={assetTypeColors[index % assetTypeColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Overdue Contracts Summary">
        <Table
          headers={['Contract ID', 'Customer', 'Branch', 'Overdue Installments', 'Overdue Amount']}
          hasData={overdueSummary.length > 0}
          emptyMessage="No overdue contracts in scope."
          minWidthClassName="min-w-[900px]"
        >
          {overdueSummary.map((row) => (
            <tr key={row.contractId}>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-700">{row.contractId}</td>
              <td className="whitespace-nowrap px-4 py-3">{row.customerName}</td>
              <td className="whitespace-nowrap px-4 py-3">{row.branch}</td>
              <td className="whitespace-nowrap px-4 py-3">{row.overdueInstallments}</td>
              <td className="whitespace-nowrap px-4 py-3">{formatCurrency(row.overdueAmount)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default Reports;
