import { Link, useParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Table from '../components/Table';
import { useContracts } from '../hooks/useContracts';
import { useCustomers } from '../hooks/useCustomers';
import type { Role } from '../types';
import {
  getContractOutstanding,
  getContractTotalPaid,
} from '../utils/contractMetrics';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { getVisibleBranches } from '../utils/roleAccess';

interface CustomerProfileProps {
  role: Role;
}

const CustomerProfile = ({ role }: CustomerProfileProps) => {
  const { id } = useParams<{ id: string }>();
  const customersQuery = useCustomers();
  const contractsQuery = useContracts();
  const visibleBranches = getVisibleBranches(role);

  const customers = customersQuery.data ?? [];
  const contracts = contractsQuery.data ?? [];

  const customer = customers.find((item) => item.id === id);

  if (customersQuery.isLoading || contractsQuery.isLoading) {
    return <p className="rounded-lg bg-white p-4 text-sm text-slate-500">Loading customer profile...</p>;
  }

  if (!customer) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Customer profile not found.
      </div>
    );
  }

  if (!visibleBranches.includes(customer.branch)) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        You do not have access to this customer profile.
      </div>
    );
  }

  const customerContracts = contracts.filter((contract) => contract.customerId === customer.id);
  const activeContracts = customerContracts.filter((contract) => contract.status !== 'Completed').length;
  const completedContracts = customerContracts.filter((contract) => contract.status === 'Completed').length;
  const totalOutstanding = customerContracts.reduce(
    (sum, contract) => sum + getContractOutstanding(contract),
    0,
  );
  const totalPaid = customerContracts.reduce(
    (sum, contract) => sum + getContractTotalPaid(contract),
    0,
  );

  return (
    <div className="min-w-0 space-y-6">
      <Card title="Customer Information">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p>
            <span className="font-semibold text-slate-700">Name:</span> {customer.name}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Phone:</span> {customer.phone}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Email:</span> {customer.email}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Branch:</span> {customer.branch}
          </p>
          <p>
            <span className="font-semibold text-slate-700">Address:</span> {customer.address}
          </p>
          <p>
            <span className="font-semibold text-slate-700">NIN/ID:</span> {customer.nin}
          </p>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Active Contracts" value={String(activeContracts)} />
        <Card title="Completed Contracts" value={String(completedContracts)} />
        <Card title="Total Outstanding" value={formatCurrency(totalOutstanding)} />
        <Card title="Total Paid" value={formatCurrency(totalPaid)} />
      </div>

      <Table
        headers={[
          'Contract ID',
          'Item',
          'Branch',
          'Status',
          'Start Date',
          'Outstanding',
          'Action',
        ]}
        hasData={customerContracts.length > 0}
        emptyMessage="This customer has no contracts."
        minWidthClassName="min-w-[980px]"
      >
        {customerContracts.map((contract) => (
          <tr key={contract.id}>
            <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-700">{contract.id}</td>
            <td className="px-4 py-3">{contract.item}</td>
            <td className="whitespace-nowrap px-4 py-3">{contract.branch}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <Badge status={contract.status} />
            </td>
            <td className="whitespace-nowrap px-4 py-3">{formatDate(contract.startDate)}</td>
            <td className="whitespace-nowrap px-4 py-3">
              {formatCurrency(getContractOutstanding(contract))}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <Link className="btn-secondary w-full sm:w-auto" to={`/contracts/${contract.id}`}>
                View Contract
              </Link>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default CustomerProfile;
