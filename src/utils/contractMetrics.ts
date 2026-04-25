import type { Contract, PaymentRecord } from '../types';

export const getContractOutstanding = (contract: Contract): number => {
  return contract.schedule.reduce(
    (sum, item) => sum + Math.max(item.amountDue - item.amountPaid, 0),
    0,
  );
};

export const getContractTotalPaid = (contract: Contract): number => {
  return contract.schedule.reduce((sum, item) => sum + item.amountPaid, 0);
};

export const getContractExpectedTotal = (contract: Contract): number => {
  return contract.schedule.reduce((sum, item) => sum + item.amountDue, 0);
};

export const getContractProgress = (contract: Contract): number => {
  const expected = getContractExpectedTotal(contract);
  if (!expected) {
    return 0;
  }

  return Math.min(100, Math.round((getContractTotalPaid(contract) / expected) * 100));
};

export const isDateWithinRange = (
  dateValue: string,
  startDate?: string,
  endDate?: string,
): boolean => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (startDate) {
    const start = new Date(startDate);
    if (!Number.isNaN(start.getTime()) && date < start) {
      return false;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime()) && date > end) {
      return false;
    }
  }

  return true;
};

export const getMonthBoundaries = (date = new Date()): {
  firstDay: string;
  lastDay: string;
} => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    firstDay: first.toISOString().slice(0, 10),
    lastDay: last.toISOString().slice(0, 10),
  };
};

export const sumPayments = (payments: PaymentRecord[]): number => {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
};
