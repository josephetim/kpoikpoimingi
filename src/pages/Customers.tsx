import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Table from '../components/Table';
import { useContracts } from '../hooks/useContracts';
import { useCustomers } from '../hooks/useCustomers';
import { BRANCHES, type Role } from '../types';
import { getContractOutstanding } from '../utils/contractMetrics';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { getVisibleBranches } from '../utils/roleAccess';

interface CustomersProps {
  role: Role;
}

const Customers = ({ role }: CustomersProps) => {
  const customersQuery = useCustomers();
  const contractsQuery = useContracts();

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<'All' | (typeof BRANCHES)[number]>('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const customers = customersQuery.data ?? [];
  const contracts = contractsQuery.data ?? [];
  const visibleBranches = getVisibleBranches(role);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => visibleBranches.includes(customer.branch))
      .filter((customer) => {
        const normalized = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !normalized ||
          customer.name.toLowerCase().includes(normalized) ||
          customer.phone.toLowerCase().includes(normalized) ||
          customer.email.toLowerCase().includes(normalized);

        const matchesBranch =
          branchFilter === 'All' ? true : customer.branch === branchFilter;

        return matchesSearch && matchesBranch;
      });
  }, [branchFilter, customers, searchTerm, visibleBranches]);

  const selectedCustomer = filteredCustomers.find((customer) => customer.id === selectedCustomerId) ?? null;
  const selectedCustomerContracts = contracts
    .filter((contract) => contract.customerId === selectedCustomer?.id)
    .slice()
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const selectedCustomerOutstanding = selectedCustomerContracts.reduce(
    (sum, contract) => sum + getContractOutstanding(contract),
    0,
  );
  const selectedCustomerActiveContracts = selectedCustomerContracts.filter(
    (contract) => contract.status !== 'Completed',
  ).length;

  const resetFilters = () => {
    setSearchTerm('');
    setBranchFilter('All');
  };

  if (customersQuery.isLoading || contractsQuery.isLoading) {
    return <p className="rounded-lg bg-white p-4 text-sm text-slate-500">Loading customers...</p>;
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Filter customers by name, phone, email, and branch.</p>
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
              className="input-base w-full min-w-0"
              placeholder="Name, phone, or email"
              value={searchTerm}
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
              disabled={role === 'Staff'}
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
        </div>
      </div>

      <Table
        headers={[
          'Name',
          'Phone',
          'Email',
          'Branch',
          'Active Contracts',
          'Total Outstanding',
          'Date Registered',
        ]}
        hasData={filteredCustomers.length > 0}
        minWidthClassName="min-w-[980px]"
      >
        {filteredCustomers.map((customer) => {
          const customerContracts = contracts.filter((contract) => contract.customerId === customer.id);
          const activeContracts = customerContracts.filter((contract) => contract.status !== 'Completed').length;
          const outstanding = customerContracts.reduce(
            (sum, contract) => sum + getContractOutstanding(contract),
            0,
          );

          return (
            <tr
              key={customer.id}
              className="cursor-pointer hover:bg-slate-50"
              onClick={() => setSelectedCustomerId(customer.id)}
            >
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">{customer.name}</td>
              <td className="whitespace-nowrap px-4 py-3">{customer.phone}</td>
              <td className="whitespace-nowrap px-4 py-3">{customer.email}</td>
              <td className="whitespace-nowrap px-4 py-3">{customer.branch}</td>
              <td className="whitespace-nowrap px-4 py-3">{activeContracts}</td>
              <td className="whitespace-nowrap px-4 py-3">{formatCurrency(outstanding)}</td>
              <td className="whitespace-nowrap px-4 py-3">{formatDate(customer.dateRegistered)}</td>
            </tr>
          );
        })}
      </Table>

      <Modal
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomerId(null)}
        title="Customer Details"
        widthClassName="sm:max-w-4xl"
      >
        {selectedCustomer ? (
          <div className="min-w-0 space-y-6">
            <div className="grid gap-3 break-words text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold text-slate-700">Customer Name:</span> {selectedCustomer.name}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Phone:</span> {selectedCustomer.phone}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Email:</span> {selectedCustomer.email}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Branch:</span> {selectedCustomer.branch}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Address:</span> {selectedCustomer.address}
              </p>
              <p>
                <span className="font-semibold text-slate-700">ID/NIN:</span> {selectedCustomer.nin}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Registration Date:</span>{' '}
                {formatDate(selectedCustomer.dateRegistered)}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Active Contracts:</span>{' '}
                {selectedCustomerActiveContracts}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Outstanding Balance:</span>{' '}
                {formatCurrency(selectedCustomerOutstanding)}
              </p>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-700">Contract List Preview</h3>
                <Link
                  className="btn-secondary w-full text-xs sm:w-auto"
                  to={`/customers/${selectedCustomer.id}`}
                  onClick={() => setSelectedCustomerId(null)}
                >
                  Open Full Profile
                </Link>
              </div>
              <Table
                headers={['Contract ID', 'Item', 'Status', 'Outstanding']}
                hasData={selectedCustomerContracts.length > 0}
                emptyMessage="No contracts for this customer."
                minWidthClassName="min-w-[720px]"
              >
                {selectedCustomerContracts.slice(0, 6).map((contract) => (
                  <tr key={contract.id}>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-700">{contract.id}</td>
                    <td className="px-4 py-3">{contract.item}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge status={contract.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatCurrency(getContractOutstanding(contract))}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default Customers;
