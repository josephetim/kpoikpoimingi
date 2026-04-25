import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockContracts } from '../data/mockContracts';
import { paymentsQueryKey } from './usePayments';
import type {
  Contract,
  ContractStatus,
  PaymentRecord,
  PaymentScheduleStatus,
  RecordPaymentPayload,
} from '../types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const contractsQueryKey = ['contracts'] as const;

const fetchContracts = async (): Promise<Contract[]> => {
  await sleep(250);
  return structuredClone(mockContracts);
};

export const useContracts = () => {
  return useQuery({
    queryKey: contractsQueryKey,
    queryFn: fetchContracts,
    staleTime: Number.POSITIVE_INFINITY,
  });
};

const refreshUpcomingAndOverdueStatuses = (contract: Contract): Contract => {
  const now = new Date();
  return {
    ...contract,
    schedule: contract.schedule.map((entry) => {
      if (entry.amountPaid >= entry.amountDue) {
        return { ...entry, status: 'Paid' };
      }

      return {
        ...entry,
        status: new Date(entry.dueDate) < now ? 'Overdue' : 'Upcoming',
      };
    }),
  };
};

const nextStatusAfterPayment = (
  contract: Contract,
  outstandingBalance: number,
): ContractStatus => {
  if (contract.terminated) {
    return 'Defaulting';
  }

  if (outstandingBalance <= 0) {
    return 'Completed';
  }

  if (contract.status === 'Pending Approval' || contract.status === 'Completed') {
    return 'Active';
  }

  return contract.status;
};

export const useContractActions = () => {
  const queryClient = useQueryClient();

  const recordPaymentMutation = useMutation({
    mutationFn: async (payload: RecordPaymentPayload): Promise<PaymentRecord> => {
      await sleep(180);

      let createdPayment: PaymentRecord | null = null;

      queryClient.setQueryData<Contract[]>(contractsQueryKey, (existing) => {
        if (!existing?.length) {
          return existing;
        }

        return existing.map((contract) => {
          if (contract.id !== payload.contractId) {
            return contract;
          }

          if (contract.terminated) {
            return contract;
          }

          const nextContract = refreshUpcomingAndOverdueStatuses(contract);
          let remaining = payload.amount;
          let appliedAmount = 0;

          const updatedSchedule: Contract['schedule'] = nextContract.schedule.map((entry) => {
            if (entry.amountPaid >= entry.amountDue) {
              return entry;
            }

            if (remaining <= 0) {
              return entry;
            }

            const installmentBalance = Math.max(entry.amountDue - entry.amountPaid, 0);
            const allocation = Math.min(installmentBalance, remaining);
            remaining -= allocation;
            appliedAmount += allocation;

            const amountPaid = entry.amountPaid + allocation;
            const isFullyPaid = amountPaid >= entry.amountDue;
            const status: PaymentScheduleStatus = isFullyPaid
              ? 'Paid'
              : new Date(entry.dueDate) < new Date()
                ? 'Overdue'
                : 'Upcoming';

            return {
              ...entry,
              amountPaid,
              status,
              datePaid: payload.paymentDate,
            };
          });

          if (appliedAmount <= 0) {
            return contract;
          }

          const outstandingBalance = updatedSchedule.reduce(
            (sum, entry) => sum + Math.max(entry.amountDue - entry.amountPaid, 0),
            0,
          );

          createdPayment = {
            id: `PAY-${Date.now()}`,
            receiptNumber: `KIL-RCPT-${String(Date.now()).slice(-8)}`,
            date: payload.paymentDate,
            customerId: contract.customerId,
            customerName: contract.customerName,
            contractId: contract.id,
            item: contract.item,
            branch: contract.branch,
            amount: appliedAmount,
            method: payload.paymentMethod,
            reference: payload.reference,
            recordedBy: payload.recordedBy,
          };

          return {
            ...contract,
            schedule: updatedSchedule,
            status: nextStatusAfterPayment(contract, outstandingBalance),
          };
        });
      });

      if (!createdPayment) {
        throw new Error('Unable to apply payment. This contract may already be fully paid.');
      }

      queryClient.setQueryData<PaymentRecord[]>(paymentsQueryKey, (existing) => {
        const current = existing ?? [];
        return [createdPayment as PaymentRecord, ...current];
      });

      return createdPayment;
    },
  });

  const flagContractMutation = useMutation({
    mutationFn: async (contractId: string): Promise<void> => {
      await sleep(120);
      queryClient.setQueryData<Contract[]>(contractsQueryKey, (existing) => {
        if (!existing) {
          return existing;
        }

        return existing.map((contract) =>
          contract.id === contractId
            ? { ...contract, status: 'Defaulting', flagged: true }
            : contract,
        );
      });
    },
  });

  const terminateContractMutation = useMutation({
    mutationFn: async (contractId: string): Promise<void> => {
      await sleep(120);
      queryClient.setQueryData<Contract[]>(contractsQueryKey, (existing) => {
        if (!existing) {
          return existing;
        }

        return existing.map((contract) =>
          contract.id === contractId
            ? {
                ...contract,
                status: 'Defaulting',
                flagged: true,
                terminated: true,
              }
            : contract,
        );
      });
    },
  });

  return {
    recordPaymentMutation,
    flagContractMutation,
    terminateContractMutation,
  };
};
