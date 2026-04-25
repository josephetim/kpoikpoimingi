import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import Table from '../components/Table';
import { useContracts } from '../hooks/useContracts';
import { BRANCHES, CONTRACT_STATUSES, ITEM_CATEGORIES, type Role } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { getVisibleBranches } from '../utils/roleAccess';
import { isDateWithinRange } from '../utils/contractMetrics';

interface ContractsProps {
  role: Role;
}

const Contracts = ({ role }: ContractsProps) => {
  const { data, isLoading } = useContracts();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | (typeof CONTRACT_STATUSES)[number]>('All');
  const [assetTypeFilter, setAssetTypeFilter] = useState<'All' | (typeof ITEM_CATEGORIES)[number]>('All');
  const [branchFilter, setBranchFilter] = useState<'All' | (typeof BRANCHES)[number]>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const visibleBranches = getVisibleBranches(role);
  const contracts = data ?? [];

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setAssetTypeFilter('All');
    setBranchFilter('All');
    setStartDate('');
    setEndDate('');
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        contract.customerName.toLowerCase().includes(normalizedSearch) ||
        contract.id.toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === 'All' || contract.status === statusFilter;
      const matchesAssetType = assetTypeFilter === 'All' || contract.category === assetTypeFilter;
      const matchesRoleBranch = visibleBranches.includes(contract.branch);
      const matchesBranch =
        branchFilter === 'All' ? matchesRoleBranch : matchesRoleBranch && contract.branch === branchFilter;
      const matchesDate = isDateWithinRange(contract.startDate, startDate || undefined, endDate || undefined);

      return matchesSearch && matchesStatus && matchesAssetType && matchesBranch && matchesDate;
    });
  }, [
    assetTypeFilter,
    branchFilter,
    contracts,
    endDate,
    searchTerm,
    startDate,
    statusFilter,
    visibleBranches,
  ]);

  if (isLoading) {
    return <p className="rounded-lg bg-white p-4 text-sm text-slate-500">Loading contracts...</p>;
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Filter contracts by customer, branch, status, or start date range.
          </p>
          <button type="button" className="btn-secondary w-full sm:w-auto" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="min-w-0 sm:col-span-2 lg:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Search
            </label>
            <input
              type="text"
              className="input-base min-w-0 w-full"
              placeholder="Customer name or contract ID"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Status
            </label>
            <select
              className="input-base min-w-0 w-full"
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
              Branch
            </label>
            <select
              className="input-base min-w-0 w-full"
              value={branchFilter}
              onChange={(event) => setBranchFilter(event.target.value as typeof branchFilter)}
              disabled={role === 'Staff'}
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
              Asset Type
            </label>
            <select
              className="input-base min-w-0 w-full"
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
              className="input-base min-w-0 w-full"
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
              className="input-base min-w-0 w-full"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>
      </div>

      <Table
        headers={[
          'Contract ID',
          'Customer Name',
          'Property/Item',
          'Contract Value',
          'Down Payment',
          'Monthly Installment',
          'Duration',
          'Branch',
          'Status',
          'Start Date',
          'Action',
        ]}
        hasData={filteredContracts.length > 0}
        emptyMessage="No contracts match your filters."
      >
        {filteredContracts.map((contract) => (
          <tr key={contract.id}>
            <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-700">{contract.id}</td>
            <td className="whitespace-nowrap px-4 py-3">{contract.customerName}</td>
            <td className="px-4 py-3">{contract.item}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatCurrency(contract.contractValue)}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatCurrency(contract.downPayment)}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatCurrency(contract.monthlyInstallment)}</td>
            <td className="whitespace-nowrap px-4 py-3">{contract.durationMonths} months</td>
            <td className="whitespace-nowrap px-4 py-3">{contract.branch}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <Badge status={contract.status} />
            </td>
            <td className="whitespace-nowrap px-4 py-3">{formatDate(contract.startDate)}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <Link className="btn-secondary inline-flex" to={`/contracts/${contract.id}`}>
                View
              </Link>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default Contracts;
