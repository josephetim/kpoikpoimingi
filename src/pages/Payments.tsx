import { useMemo, useState } from 'react';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Table from '../components/Table';
import { useContracts } from '../hooks/useContracts';
import { usePayments } from '../hooks/usePayments';
import { BRANCHES } from '../types';
import { csvExport } from '../utils/csvExport';
import {
  getMonthBoundaries,
  isDateWithinRange,
  sumPayments,
} from '../utils/contractMetrics';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const Payments = () => {
  const contractsQuery = useContracts();
  const paymentsQuery = usePayments();

  const monthBoundaries = getMonthBoundaries();
  const [startDate, setStartDate] = useState(monthBoundaries.firstDay);
  const [endDate, setEndDate] = useState(monthBoundaries.lastDay);
  const [resolvedOverdueKeys, setResolvedOverdueKeys] = useState<string[]>([]);

  const contracts = contractsQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];

  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) =>
        isDateWithinRange(payment.date, startDate || undefined, endDate || undefined),
      ),
    [endDate, payments, startDate],
  );

  const expectedCollections = useMemo(
    () =>
      contracts.reduce((sum, contract) => {
        const dueInRange = contract.schedule
          .filter((entry) => isDateWithinRange(entry.dueDate, startDate || undefined, endDate || undefined))
          .reduce((entrySum, entry) => entrySum + entry.amountDue, 0);
        return sum + dueInRange;
      }, 0),
    [contracts, endDate, startDate],
  );

  const actualCollections = sumPayments(filteredPayments);
  const variance = actualCollections - expectedCollections;
  const collectionRate = expectedCollections
    ? Math.min(100, (actualCollections / expectedCollections) * 100)
    : 0;

  const branchReconciliation = BRANCHES.map((branch) => {
    const branchExpected = contracts
      .filter((contract) => contract.branch === branch)
      .reduce((sum, contract) => {
        const dueInRange = contract.schedule
          .filter((entry) => isDateWithinRange(entry.dueDate, startDate || undefined, endDate || undefined))
          .reduce((entrySum, entry) => entrySum + entry.amountDue, 0);
        return sum + dueInRange;
      }, 0);

    const branchCollected = filteredPayments
      .filter((payment) => payment.branch === branch)
      .reduce((sum, payment) => sum + payment.amount, 0);

    const branchVariance = branchCollected - branchExpected;
    const branchRate = branchExpected ? (branchCollected / branchExpected) * 100 : 0;

    return {
      branch,
      expected: branchExpected,
      collected: branchCollected,
      variance: branchVariance,
      rate: branchRate,
    };
  });

  const overdueEntries = contracts
    .flatMap((contract) =>
      contract.schedule
        .filter((entry) => entry.status === 'Overdue')
        .map((entry) => {
          const overdueBalance = Math.max(entry.amountDue - entry.amountPaid, 0);
          return {
            key: `${contract.id}-${entry.month}`,
            contractId: contract.id,
            customerName: contract.customerName,
            branch: contract.branch,
            month: entry.month,
            dueDate: entry.dueDate,
            amountDue: entry.amountDue,
            outstanding: overdueBalance,
          };
        }),
    )
    .filter((row) => row.outstanding > 0);

  const unresolvedOverdueEntries = overdueEntries.filter(
    (entry) => !resolvedOverdueKeys.includes(entry.key),
  );
  const unresolvedOverdueCount = unresolvedOverdueEntries.length;

  const markOverdueAsPaid = (key: string) => {
    setResolvedOverdueKeys((current) => (current.includes(key) ? current : [...current, key]));
  };

  const exportCsv = () => {
    csvExport(
      filteredPayments.map((payment) => ({
        Date: payment.date,
        Customer: payment.customerName,
        ContractID: payment.contractId,
        Branch: payment.branch,
        Amount: payment.amount,
        Method: payment.method,
        Reference: payment.reference,
        RecordedBy: payment.recordedBy,
      })),
      `kpoikpoimingi-payments-${startDate}-to-${endDate}.csv`,
    );
  };

  if (contractsQuery.isLoading || paymentsQuery.isLoading) {
    return <p className="rounded-lg bg-white p-4 text-sm text-slate-500">Loading payments...</p>;
  }

  return (
    <div className="space-y-6">
      {unresolvedOverdueCount > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Overdue payment alert: {unresolvedOverdueCount} overdue installment
          {unresolvedOverdueCount > 1 ? 's' : ''} need attention.
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          No unresolved overdue installments.
        </div>
      )}

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-3">
        <input
          type="date"
          className="input-base"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <input
          type="date"
          className="input-base"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
        <button type="button" className="btn-secondary" onClick={exportCsv}>
          Export to CSV
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Expected Collections" value={formatCurrency(expectedCollections)} />
        <Card title="Actual Collections" value={formatCurrency(actualCollections)} />
        <Card title="Variance" value={formatCurrency(variance)} />
        <Card title="Collection Rate %" value={`${collectionRate.toFixed(1)}%`} />
      </div>

      <Table
        headers={[
          'Date',
          'Customer',
          'Contract ID',
          'Branch',
          'Amount',
          'Method',
          'Reference',
          'Recorded By',
        ]}
        hasData={filteredPayments.length > 0}
        emptyMessage="No payments found for selected date range."
      >
        {filteredPayments.map((payment) => (
          <tr key={payment.id}>
            <td className="whitespace-nowrap px-4 py-3">{formatDate(payment.date)}</td>
            <td className="whitespace-nowrap px-4 py-3">{payment.customerName}</td>
            <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-700">{payment.contractId}</td>
            <td className="whitespace-nowrap px-4 py-3">{payment.branch}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatCurrency(payment.amount)}</td>
            <td className="whitespace-nowrap px-4 py-3">{payment.method}</td>
            <td className="whitespace-nowrap px-4 py-3">{payment.reference}</td>
            <td className="whitespace-nowrap px-4 py-3">{payment.recordedBy}</td>
          </tr>
        ))}
      </Table>

      <Table
        headers={['Branch', 'Expected', 'Collected', 'Variance', 'Collection Rate']}
        hasData={branchReconciliation.length > 0}
      >
        {branchReconciliation.map((row) => (
          <tr key={row.branch}>
            <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">{row.branch}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatCurrency(row.expected)}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatCurrency(row.collected)}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatCurrency(row.variance)}</td>
            <td className="whitespace-nowrap px-4 py-3">{row.rate.toFixed(1)}%</td>
          </tr>
        ))}
      </Table>

      <Card title="Overdue Payments Tracker">
        <Table
          headers={[
            'Contract ID',
            'Customer',
            'Branch',
            'Installment',
            'Due Date',
            'Outstanding',
            'Status',
            'Action',
          ]}
          hasData={overdueEntries.length > 0}
          emptyMessage="No overdue installments available."
        >
          {overdueEntries.map((entry) => {
            const isResolved = resolvedOverdueKeys.includes(entry.key);
            return (
              <tr key={entry.key} className={isResolved ? '' : 'bg-red-50/60'}>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-brand-700">{entry.contractId}</td>
                <td className="whitespace-nowrap px-4 py-3">{entry.customerName}</td>
                <td className="whitespace-nowrap px-4 py-3">{entry.branch}</td>
                <td className="whitespace-nowrap px-4 py-3">Month {entry.month}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatDate(entry.dueDate)}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatCurrency(entry.outstanding)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge status={isResolved ? 'Paid' : 'Overdue'} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    disabled={isResolved}
                    onClick={() => markOverdueAsPaid(entry.key)}
                  >
                    {isResolved ? 'Marked Paid' : 'Mark as Paid'}
                  </button>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </div>
  );
};

export default Payments;
