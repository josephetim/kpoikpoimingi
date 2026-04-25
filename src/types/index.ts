export type Branch = 'Abuja HQ' | 'Lagos' | 'Port Harcourt';

export type Role = 'Staff' | 'Admin' | 'Super Admin';

export type ContractStatus =
  | 'Active'
  | 'Completed'
  | 'Defaulting'
  | 'Pending Approval';

export type PaymentScheduleStatus = 'Paid' | 'Upcoming' | 'Overdue';

export type PaymentMethod = 'Bank Transfer' | 'Cash' | 'POS';

export type ItemCategory = 'Property' | 'Vehicle' | 'Electronics';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  nin: string;
  branch: Branch;
  dateRegistered: string;
}

export interface PaymentScheduleEntry {
  month: number;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: PaymentScheduleStatus;
  datePaid?: string;
}

export interface Contract {
  id: string;
  customerId: string;
  customerName: string;
  item: string;
  category: ItemCategory;
  contractValue: number;
  downPayment: number;
  interestRate: number;
  monthlyInstallment: number;
  durationMonths: number;
  branch: Branch;
  status: ContractStatus;
  startDate: string;
  expectedEndDate: string;
  schedule: PaymentScheduleEntry[];
  createdAt: string;
  flagged: boolean;
  terminated: boolean;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  contractId: string;
  item: string;
  branch: Branch;
  amount: number;
  method: PaymentMethod;
  reference: string;
  recordedBy: string;
}

export interface RecordPaymentPayload {
  contractId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference: string;
  recordedBy: string;
}

export const BRANCHES: Branch[] = ['Abuja HQ', 'Lagos', 'Port Harcourt'];

export const ROLES: Role[] = ['Staff', 'Admin', 'Super Admin'];

export const CONTRACT_STATUSES: ContractStatus[] = [
  'Active',
  'Completed',
  'Defaulting',
  'Pending Approval',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Bank Transfer',
  'Cash',
  'POS',
];

export const ITEM_CATEGORIES: ItemCategory[] = [
  'Vehicle',
  'Electronics',
  'Property',
];
