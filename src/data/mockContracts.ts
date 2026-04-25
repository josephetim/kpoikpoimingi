import { mockCustomers } from './mockCustomers';
import type { Contract, ContractStatus, ItemCategory, PaymentScheduleEntry } from '../types';

interface ContractSeed {
  id: string;
  customerId: string;
  item: string;
  category: ItemCategory;
  contractValue: number;
  downPayment: number;
  interestRate: number;
  durationMonths: number;
  branch: Contract['branch'];
  status: ContractStatus;
  startDate: string;
  createdAt: string;
  paidInstallments: number;
  overdueInstallments?: number;
  flagged?: boolean;
  terminated?: boolean;
}

const customerLookup = new Map(mockCustomers.map((customer) => [customer.id, customer]));

const addMonths = (date: Date, months: number): Date => {
  const cloned = new Date(date);
  cloned.setMonth(cloned.getMonth() + months);
  return cloned;
};

const addDays = (date: Date, days: number): Date => {
  const cloned = new Date(date);
  cloned.setDate(cloned.getDate() + days);
  return cloned;
};

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const calculateMonthlyInstallment = (
  contractValue: number,
  downPayment: number,
  interestRate: number,
  durationMonths: number,
): number => {
  const financedAmount = contractValue - downPayment;
  const payable = financedAmount * (1 + interestRate / 100);
  return Math.round(payable / durationMonths);
};

const createSchedule = (
  startDate: string,
  durationMonths: number,
  monthlyInstallment: number,
  paidInstallments: number,
  overdueInstallments: number,
): PaymentScheduleEntry[] => {
  const now = new Date();
  const start = new Date(startDate);

  return Array.from({ length: durationMonths }, (_, index) => {
    const dueDate = addMonths(start, index);
    const dueDateIso = toIsoDate(dueDate);
    const paid = index < paidInstallments;
    const overdueLimit = paidInstallments + overdueInstallments;

    if (paid) {
      return {
        month: index + 1,
        dueDate: dueDateIso,
        amountDue: monthlyInstallment,
        amountPaid: monthlyInstallment,
        status: 'Paid',
        datePaid: toIsoDate(addDays(dueDate, (index % 4) + 1)),
      };
    }

    const isOverdue = index < overdueLimit && dueDate < now;
    return {
      month: index + 1,
      dueDate: dueDateIso,
      amountDue: monthlyInstallment,
      amountPaid: 0,
      status: isOverdue ? 'Overdue' : 'Upcoming',
    };
  });
};

const contractSeeds: ContractSeed[] = [
  {
    id: 'KIL-CTR-1001',
    customerId: 'CUS-001',
    item: '2-Bedroom Apartment, Lokogoma',
    category: 'Property',
    contractValue: 9500000,
    downPayment: 2500000,
    interestRate: 18,
    durationMonths: 24,
    branch: 'Abuja HQ',
    status: 'Active',
    startDate: '2025-01-10',
    createdAt: '2024-12-29',
    paidInstallments: 15,
  },
  {
    id: 'KIL-CTR-1002',
    customerId: 'CUS-002',
    item: 'Toyota Camry 2019',
    category: 'Vehicle',
    contractValue: 12500000,
    downPayment: 3200000,
    interestRate: 16,
    durationMonths: 24,
    branch: 'Port Harcourt',
    status: 'Defaulting',
    startDate: '2024-09-15',
    createdAt: '2024-09-01',
    paidInstallments: 10,
    overdueInstallments: 5,
    flagged: true,
  },
  {
    id: 'KIL-CTR-1003',
    customerId: 'CUS-003',
    item: 'Samsung Electronics Bundle (TV, Fridge, AC)',
    category: 'Electronics',
    contractValue: 2850000,
    downPayment: 750000,
    interestRate: 14,
    durationMonths: 12,
    branch: 'Lagos',
    status: 'Active',
    startDate: '2025-07-01',
    createdAt: '2025-06-19',
    paidInstallments: 9,
  },
  {
    id: 'KIL-CTR-1004',
    customerId: 'CUS-004',
    item: '3-Bedroom Terrace Duplex, Karsana',
    category: 'Property',
    contractValue: 18500000,
    downPayment: 5200000,
    interestRate: 20,
    durationMonths: 24,
    branch: 'Abuja HQ',
    status: 'Pending Approval',
    startDate: '2026-05-10',
    createdAt: '2026-04-18',
    paidInstallments: 0,
  },
  {
    id: 'KIL-CTR-1005',
    customerId: 'CUS-005',
    item: 'Toyota Hilux 2020',
    category: 'Vehicle',
    contractValue: 14700000,
    downPayment: 4700000,
    interestRate: 18,
    durationMonths: 24,
    branch: 'Abuja HQ',
    status: 'Active',
    startDate: '2025-03-03',
    createdAt: '2025-02-20',
    paidInstallments: 13,
  },
  {
    id: 'KIL-CTR-1006',
    customerId: 'CUS-006',
    item: 'LG Home Electronics Pack',
    category: 'Electronics',
    contractValue: 2120000,
    downPayment: 560000,
    interestRate: 13,
    durationMonths: 12,
    branch: 'Port Harcourt',
    status: 'Completed',
    startDate: '2024-01-12',
    createdAt: '2023-12-28',
    paidInstallments: 12,
  },
  {
    id: 'KIL-CTR-1007',
    customerId: 'CUS-007',
    item: 'Mazda CX-5 2018',
    category: 'Vehicle',
    contractValue: 10900000,
    downPayment: 2700000,
    interestRate: 15,
    durationMonths: 18,
    branch: 'Lagos',
    status: 'Active',
    startDate: '2025-06-05',
    createdAt: '2025-05-22',
    paidInstallments: 10,
  },
  {
    id: 'KIL-CTR-1008',
    customerId: 'CUS-008',
    item: 'Mini Flat, Eliozu',
    category: 'Property',
    contractValue: 6200000,
    downPayment: 1800000,
    interestRate: 19,
    durationMonths: 18,
    branch: 'Port Harcourt',
    status: 'Defaulting',
    startDate: '2024-08-11',
    createdAt: '2024-07-25',
    paidInstallments: 7,
    overdueInstallments: 6,
    flagged: true,
  },
  {
    id: 'KIL-CTR-1009',
    customerId: 'CUS-009',
    item: 'Infinix + Hisense Electronics Set',
    category: 'Electronics',
    contractValue: 1340000,
    downPayment: 400000,
    interestRate: 12,
    durationMonths: 12,
    branch: 'Abuja HQ',
    status: 'Active',
    startDate: '2025-09-19',
    createdAt: '2025-09-02',
    paidInstallments: 6,
  },
  {
    id: 'KIL-CTR-1010',
    customerId: 'CUS-010',
    item: 'Honda Accord 2017',
    category: 'Vehicle',
    contractValue: 9800000,
    downPayment: 3000000,
    interestRate: 16,
    durationMonths: 18,
    branch: 'Lagos',
    status: 'Completed',
    startDate: '2024-02-08',
    createdAt: '2024-01-26',
    paidInstallments: 18,
  },
  {
    id: 'KIL-CTR-1011',
    customerId: 'CUS-011',
    item: '1-Bedroom Apartment, Jabi',
    category: 'Property',
    contractValue: 7100000,
    downPayment: 2100000,
    interestRate: 17,
    durationMonths: 18,
    branch: 'Abuja HQ',
    status: 'Active',
    startDate: '2025-04-12',
    createdAt: '2025-03-25',
    paidInstallments: 12,
  },
  {
    id: 'KIL-CTR-1012',
    customerId: 'CUS-012',
    item: 'Nissan X-Trail 2018',
    category: 'Vehicle',
    contractValue: 12200000,
    downPayment: 3600000,
    interestRate: 16,
    durationMonths: 24,
    branch: 'Port Harcourt',
    status: 'Pending Approval',
    startDate: '2026-05-25',
    createdAt: '2026-04-20',
    paidInstallments: 0,
  },
  {
    id: 'KIL-CTR-1013',
    customerId: 'CUS-013',
    item: 'Panasonic Home Tech Bundle',
    category: 'Electronics',
    contractValue: 1760000,
    downPayment: 520000,
    interestRate: 12,
    durationMonths: 12,
    branch: 'Abuja HQ',
    status: 'Completed',
    startDate: '2024-05-09',
    createdAt: '2024-04-20',
    paidInstallments: 12,
  },
  {
    id: 'KIL-CTR-1014',
    customerId: 'CUS-014',
    item: '2-Bedroom Bungalow, Rumuokoro',
    category: 'Property',
    contractValue: 8700000,
    downPayment: 2400000,
    interestRate: 18,
    durationMonths: 24,
    branch: 'Port Harcourt',
    status: 'Active',
    startDate: '2025-02-20',
    createdAt: '2025-02-03',
    paidInstallments: 14,
  },
  {
    id: 'KIL-CTR-1015',
    customerId: 'CUS-015',
    item: 'Mercedes C300 2016',
    category: 'Vehicle',
    contractValue: 15200000,
    downPayment: 5200000,
    interestRate: 21,
    durationMonths: 24,
    branch: 'Lagos',
    status: 'Defaulting',
    startDate: '2024-10-10',
    createdAt: '2024-09-28',
    paidInstallments: 8,
    overdueInstallments: 6,
    flagged: true,
  },
  {
    id: 'KIL-CTR-1016',
    customerId: 'CUS-016',
    item: 'Luxury Electronics Set (TV + Audio + Freezer)',
    category: 'Electronics',
    contractValue: 2480000,
    downPayment: 620000,
    interestRate: 13,
    durationMonths: 12,
    branch: 'Port Harcourt',
    status: 'Active',
    startDate: '2025-11-03',
    createdAt: '2025-10-20',
    paidInstallments: 5,
  },
  {
    id: 'KIL-CTR-1017',
    customerId: 'CUS-017',
    item: 'Toyota Corolla 2020',
    category: 'Vehicle',
    contractValue: 11800000,
    downPayment: 3800000,
    interestRate: 17,
    durationMonths: 18,
    branch: 'Abuja HQ',
    status: 'Pending Approval',
    startDate: '2026-06-01',
    createdAt: '2026-04-15',
    paidInstallments: 0,
  },
  {
    id: 'KIL-CTR-1018',
    customerId: 'CUS-018',
    item: '2-Bedroom Flat, Yaba',
    category: 'Property',
    contractValue: 11200000,
    downPayment: 3600000,
    interestRate: 19,
    durationMonths: 24,
    branch: 'Lagos',
    status: 'Active',
    startDate: '2025-05-18',
    createdAt: '2025-05-04',
    paidInstallments: 11,
  },
  {
    id: 'KIL-CTR-1019',
    customerId: 'CUS-019',
    item: 'Kia Sportage 2019',
    category: 'Vehicle',
    contractValue: 12800000,
    downPayment: 4200000,
    interestRate: 18,
    durationMonths: 24,
    branch: 'Port Harcourt',
    status: 'Active',
    startDate: '2025-01-28',
    createdAt: '2025-01-15',
    paidInstallments: 13,
  },
  {
    id: 'KIL-CTR-1020',
    customerId: 'CUS-020',
    item: '4-Bedroom Duplex, Katampe',
    category: 'Property',
    contractValue: 23500000,
    downPayment: 7000000,
    interestRate: 22,
    durationMonths: 24,
    branch: 'Abuja HQ',
    status: 'Defaulting',
    startDate: '2024-07-05',
    createdAt: '2024-06-20',
    paidInstallments: 9,
    overdueInstallments: 8,
    flagged: true,
  },
  {
    id: 'KIL-CTR-1021',
    customerId: 'CUS-004',
    item: 'Office Electronics Package',
    category: 'Electronics',
    contractValue: 1680000,
    downPayment: 500000,
    interestRate: 11,
    durationMonths: 12,
    branch: 'Abuja HQ',
    status: 'Active',
    startDate: '2025-12-05',
    createdAt: '2025-11-22',
    paidInstallments: 4,
  },
  {
    id: 'KIL-CTR-1022',
    customerId: 'CUS-003',
    item: 'Mini SUV - Peugeot 3008',
    category: 'Vehicle',
    contractValue: 13700000,
    downPayment: 4300000,
    interestRate: 16,
    durationMonths: 24,
    branch: 'Lagos',
    status: 'Active',
    startDate: '2025-08-22',
    createdAt: '2025-08-01',
    paidInstallments: 8,
  },
  {
    id: 'KIL-CTR-1023',
    customerId: 'CUS-012',
    item: '2-Bedroom Flat, Trans-Amadi',
    category: 'Property',
    contractValue: 7900000,
    downPayment: 2200000,
    interestRate: 18,
    durationMonths: 18,
    branch: 'Port Harcourt',
    status: 'Completed',
    startDate: '2024-03-11',
    createdAt: '2024-02-24',
    paidInstallments: 18,
  },
  {
    id: 'KIL-CTR-1024',
    customerId: 'CUS-009',
    item: 'Hisense Refrigerator + AC + Washing Machine',
    category: 'Electronics',
    contractValue: 1940000,
    downPayment: 620000,
    interestRate: 13,
    durationMonths: 12,
    branch: 'Abuja HQ',
    status: 'Pending Approval',
    startDate: '2026-05-14',
    createdAt: '2026-04-19',
    paidInstallments: 0,
  },
];

export const mockContracts: Contract[] = contractSeeds.map((seed) => {
  const customer = customerLookup.get(seed.customerId);
  if (!customer) {
    throw new Error(`Unknown customer id in contract seed: ${seed.customerId}`);
  }

  const monthlyInstallment = calculateMonthlyInstallment(
    seed.contractValue,
    seed.downPayment,
    seed.interestRate,
    seed.durationMonths,
  );

  return {
    id: seed.id,
    customerId: seed.customerId,
    customerName: customer.name,
    item: seed.item,
    category: seed.category,
    contractValue: seed.contractValue,
    downPayment: seed.downPayment,
    interestRate: seed.interestRate,
    monthlyInstallment,
    durationMonths: seed.durationMonths,
    branch: seed.branch,
    status: seed.status,
    startDate: seed.startDate,
    expectedEndDate: toIsoDate(addMonths(new Date(seed.startDate), seed.durationMonths - 1)),
    schedule: createSchedule(
      seed.startDate,
      seed.durationMonths,
      monthlyInstallment,
      seed.paidInstallments,
      seed.overdueInstallments ?? 0,
    ),
    createdAt: seed.createdAt,
    flagged: seed.flagged ?? false,
    terminated: seed.terminated ?? false,
  };
});
