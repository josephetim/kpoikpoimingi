import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Card from '../components/Card';
import ReceiptModal from '../components/ReceiptModal';
import RecordPaymentModal from '../components/RecordPaymentModal';
import Table from '../components/Table';
import { useContractActions, useContracts } from '../hooks/useContracts';
import { useCustomers } from '../hooks/useCustomers';
import { usePayments } from '../hooks/usePayments';
import type { PaymentRecord, Role } from '../types';
import {
  getContractOutstanding,
  getContractProgress,
  getContractTotalPaid,
} from '../utils/contractMetrics';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { canManageRiskActions, getVisibleBranches } from '../utils/roleAccess';

interface ContractDetailProps {
  role: Role;
}

const ContractDetail = ({ role }: ContractDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const contractsQuery = useContracts();
  const customersQuery = useCustomers();
  const paymentsQuery = usePayments();
  const { recordPaymentMutation, flagContractMutation, terminateContractMutation } =
    useContractActions();

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [receiptPayment, setReceiptPayment] = useState<PaymentRecord | null>(null);

  const contracts = contractsQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const payments = paymentsQuery.data ?? [];

  const contract = contracts.find((item) => item.id === id);
  const customer = customers.find((item) => item.id === contract?.customerId) ?? null;
  const visibleBranches = getVisibleBranches(role);

  const contractPayments = useMemo(
    () =>
      payments
        .filter((payment) => payment.contractId === contract?.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [contract?.id, payments],
  );

  if (contractsQuery.isLoading || customersQuery.isLoading || paymentsQuery.isLoading) {
    return <p className="rounded-lg bg-white p-4 text-sm text-slate-500">Loading contract details...</p>;
  }

  if (!contract) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Contract not found. <Link to="/contracts" className="font-semibold underline">Back to contracts</Link>
      </div>
    );
  }

  if (!visibleBranches.includes(contract.branch)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        You do not have access to this contract record.
      </div>
    );
  }

  const outstandingBalance = getContractOutstanding(contract);
  const totalPaid = getContractTotalPaid(contract);
  const completionPercentage = getContractProgress(contract);
  const latestPayment = contractPayments[0] ?? null;
  const canPerformRiskActions = canManageRiskActions(role);
  const canRecordPayment = !contract.terminated && contract.status !== 'Completed';

  const handleRecordPayment = async (payload: {
    amount: number;
    paymentDate: string;
    paymentMethod: 'Bank Transfer' | 'Cash' | 'POS';
    reference: string;
  }) => {
    const recorder =
      role === 'Super Admin' ? 'Super Admin Console' : role === 'Admin' ? 'Branch Admin' : 'Abuja HQ Staff';

    const payment = await recordPaymentMutation.mutateAsync({
      contractId: contract.id,
      amount: payload.amount,
      paymentDate: payload.paymentDate,
      paymentMethod: payload.paymentMethod,
      reference: payload.reference,
      recordedBy: recorder,
    });

    setFeedback('Payment recorded successfully.');
    setReceiptPayment(payment);
  };

  const handleGenerateReceipt = () => {
    const paymentForReceipt = receiptPayment ?? latestPayment;
    if (!paymentForReceipt) {
      setFeedback('No payment available yet. Record a payment first.');
      return;
    }

    setReceiptPayment(paymentForReceipt);
    setIsReceiptOpen(true);
  };

  const handleFlagContract = async () => {
    await flagContractMutation.mutateAsync(contract.id);
    setFeedback('Contract flagged as defaulting.');
  };

  const handleTerminateContract = async () => {
    await terminateContractMutation.mutateAsync(contract.id);
    setFeedback('Contract marked as terminated.');
  };

  return (
    <div className="min-w-0 space-y-6">
      {feedback ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedback}
        </div>
      ) : null}

      {contract.terminated ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This contract has been terminated. Further payments are disabled.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Customer Information">
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold text-slate-700">Name:</span> {customer?.name}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Phone:</span> {customer?.phone}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Address:</span> {customer?.address}
            </p>
            <p>
              <span className="font-semibold text-slate-700">NIN/ID:</span> {customer?.nin}
            </p>
          </div>
        </Card>

        <Card title="Contract Information">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <p>
              <span className="font-semibold text-slate-700">Item:</span> {contract.item}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Status:</span> <Badge status={contract.status} />
            </p>
            <p>
              <span className="font-semibold text-slate-700">Total Value:</span>{' '}
              {formatCurrency(contract.contractValue)}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Down Payment:</span>{' '}
              {formatCurrency(contract.downPayment)}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Balance:</span>{' '}
              {formatCurrency(outstandingBalance)}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Interest Rate:</span>{' '}
              {contract.interestRate}%
            </p>
            <p>
              <span className="font-semibold text-slate-700">Monthly Installment:</span>{' '}
              {formatCurrency(contract.monthlyInstallment)}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Start Date:</span>{' '}
              {formatDate(contract.startDate)}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Expected End Date:</span>{' '}
              {formatDate(contract.expectedEndDate)}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Total Paid:</span>{' '}
              {formatCurrency(totalPaid)}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Contract Completion Progress">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">{completionPercentage}% completed</span>
          <span className="text-slate-500">{formatCurrency(totalPaid)} paid</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary w-full sm:w-auto"
          onClick={() => setIsRecordPaymentOpen(true)}
          disabled={!canRecordPayment}
        >
          Record Payment
        </button>
        <button type="button" className="btn-secondary w-full sm:w-auto" onClick={handleGenerateReceipt}>
          Generate Receipt
        </button>
        {canPerformRiskActions ? (
          <>
            <button
              type="button"
              className="btn-danger w-full sm:w-auto"
              onClick={handleFlagContract}
              disabled={flagContractMutation.isPending}
            >
              Flag Account
            </button>
            <button
              type="button"
              className="btn-danger w-full sm:w-auto"
              onClick={handleTerminateContract}
              disabled={terminateContractMutation.isPending}
            >
              Terminate Contract
            </button>
          </>
        ) : null}
      </div>

      <Table
        headers={['Month', 'Due Date', 'Amount Due', 'Amount Paid', 'Status', 'Date Paid']}
        hasData={contract.schedule.length > 0}
        minWidthClassName="min-w-[860px]"
      >
        {contract.schedule.map((scheduleItem) => (
          <tr key={`${contract.id}-${scheduleItem.month}`}>
            <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
              Month {scheduleItem.month}
            </td>
            <td className="whitespace-nowrap px-4 py-3">{formatDate(scheduleItem.dueDate)}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatCurrency(scheduleItem.amountDue)}</td>
            <td className="whitespace-nowrap px-4 py-3">{formatCurrency(scheduleItem.amountPaid)}</td>
            <td className="whitespace-nowrap px-4 py-3">
              <Badge status={scheduleItem.status} />
            </td>
            <td className="whitespace-nowrap px-4 py-3">{formatDate(scheduleItem.datePaid)}</td>
          </tr>
        ))}
      </Table>

      <RecordPaymentModal
        open={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        onSubmit={handleRecordPayment}
        isSubmitting={recordPaymentMutation.isPending}
      />

      <ReceiptModal
        open={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        payment={receiptPayment ?? latestPayment}
        contract={contract}
        customer={customer}
        balanceRemaining={outstandingBalance}
      />
    </div>
  );
};

export default ContractDetail;
