import { useEffect, useState } from 'react';
import Modal from './Modal';
import type { PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../types';

interface RecordPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    reference: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

const RecordPaymentModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: RecordPaymentModalProps) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setAmount('');
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('Bank Transfer');
    setReference('');
    setError('');
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid amount.');
      return;
    }

    if (!reference.trim()) {
      setError('Reference number is required.');
      return;
    }

    try {
      await onSubmit({
        amount: numericAmount,
        paymentDate,
        paymentMethod,
        reference: reference.trim(),
      });
      onClose();
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError('Unable to record payment.');
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Record Payment" widthClassName="sm:max-w-lg">
      <form className="min-w-0 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="input-base w-full min-w-0"
            placeholder="e.g. 250000"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Payment Date
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            className="input-base w-full min-w-0"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            className="input-base w-full min-w-0"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Reference Number
          </label>
          <input
            type="text"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            className="input-base w-full min-w-0"
            placeholder="e.g. UTR10293847"
          />
        </div>

        {error ? <p className="text-xs font-semibold text-red-600">{error}</p> : null}

        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-secondary w-full sm:w-auto" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Save Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;
