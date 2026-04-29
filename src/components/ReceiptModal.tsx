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
    <Modal open={open} onClose={onClose} title="Receipt" widthClassName="sm:max-w-3xl">
      {canRenderReceipt ? (
        <div className="min-w-0 space-y-6">
          <div id="receipt-print-area" className="max-w-full overflow-hidden rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Logo size="lg" className="mb-2 max-w-full" />
                <p className="text-sm text-slate-500">Hire Purchase Payment Receipt</p>
              </div>
              <div className="text-left text-sm sm:text-right">
                <p className="font-semibold text-slate-700">Receipt No</p>
                <p className="break-words">{payment?.receiptNumber}</p>
                <p className="mt-2 font-semibold text-slate-700">Date</p>
                <p>{formatDate(payment?.date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 break-words text-sm sm:grid-cols-2">
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
                <p className="break-words font-semibold text-slate-900">{payment?.reference}</p>
              </div>
              <div>
                <p className="text-slate-500">Recorded By</p>
                <p className="font-semibold text-slate-900">{payment?.recordedBy}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => window.print()}>
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
