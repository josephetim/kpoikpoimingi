import Modal from './Modal';
import Logo from './Logo';
import type { Contract, Customer, PaymentRecord } from '../types';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  contract: Contract | null;
  customer: Customer | null;
  balanceRemaining: number;
}

const ReceiptModal = ({
  open,
  onClose,
  payment,
  contract,
  customer,
  balanceRemaining,
}: ReceiptModalProps) => {
  const canRenderReceipt = Boolean(payment && contract && customer);

  return (
    <Modal open={open} onClose={onClose} title="Receipt" widthClassName="max-w-3xl">
      {canRenderReceipt ? (
        <div className="space-y-6">
          <div id="receipt-print-area" className="rounded-xl border border-slate-200 p-5">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <Logo size="lg" className="mb-2 max-w-[240px]" />
                <p className="text-sm text-slate-500">Hire Purchase Payment Receipt</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-slate-700">Receipt No</p>
                <p>{payment?.receiptNumber}</p>
                <p className="mt-2 font-semibold text-slate-700">Date</p>
                <p>{formatDate(payment?.date)}</p>
              </div>
            </div>

            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-slate-500">Customer Name</p>
                <p className="font-semibold text-slate-900">{customer?.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Contract ID</p>
                <p className="font-semibold text-slate-900">{contract?.id}</p>
              </div>
              <div>
                <p className="text-slate-500">Item</p>
                <p className="font-semibold text-slate-900">{contract?.item}</p>
              </div>
              <div>
                <p className="text-slate-500">Amount Paid</p>
                <p className="font-semibold text-slate-900">{formatCurrency(payment?.amount ?? 0)}</p>
              </div>
              <div>
                <p className="text-slate-500">Balance Remaining</p>
                <p className="font-semibold text-slate-900">{formatCurrency(balanceRemaining)}</p>
              </div>
              <div>
                <p className="text-slate-500">Payment Method</p>
                <p className="font-semibold text-slate-900">{payment?.method}</p>
              </div>
              <div>
                <p className="text-slate-500">Reference Number</p>
                <p className="font-semibold text-slate-900">{payment?.reference}</p>
              </div>
              <div>
                <p className="text-slate-500">Recorded By</p>
                <p className="font-semibold text-slate-900">{payment?.recordedBy}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="btn-primary" onClick={() => window.print()}>
              Print / Download PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No payment record available for receipt generation.
        </div>
      )}
    </Modal>
  );
};

export default ReceiptModal;
