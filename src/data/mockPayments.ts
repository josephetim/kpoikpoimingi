import { mockContracts } from './mockContracts';
import type { Branch, PaymentMethod, PaymentRecord } from '../types';

const branchRecorders: Record<Branch, string[]> = {
  'Abuja HQ': ['Grace Danjuma', 'Musa Lawal', 'Kemi Ojo'],
  Lagos: ['Tolu Akinyemi', 'Bisi Alade', 'Sola Adedayo'],
  'Port Harcourt': ['Ikechukwu Nwosu', 'Rita Boma', 'Tamuno Peters'],
};

const methods: PaymentMethod[] = ['Bank Transfer', 'Cash', 'POS'];

const getRecorder = (branch: Branch, index: number): string => {
  const names = branchRecorders[branch];
  return names[index % names.length];
};

export const mockPayments: PaymentRecord[] = mockContracts
  .flatMap((contract) =>
    contract.schedule
      .filter((entry) => entry.status === 'Paid' && entry.datePaid)
      .map((entry, index) => {
        const paymentDate = entry.datePaid ?? contract.startDate;
        const sequence = `${contract.id.slice(-4)}${String(entry.month).padStart(2, '0')}`;
        return {
          id: `PAY-${sequence}`,
          receiptNumber: `KIL-RCPT-${sequence}`,
          date: paymentDate,
          customerId: contract.customerId,
          customerName: contract.customerName,
          contractId: contract.id,
          item: contract.item,
          branch: contract.branch,
          amount: entry.amountPaid,
          method: methods[index % methods.length],
          reference: `REF-${contract.id.slice(-4)}-${String(entry.month).padStart(3, '0')}`,
          recordedBy: getRecorder(contract.branch, index),
        } satisfies PaymentRecord;
      }),
  )
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
