import { useQuery } from '@tanstack/react-query';
import { mockPayments } from '../data/mockPayments';
import type { PaymentRecord } from '../types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const paymentsQueryKey = ['payments'] as const;

const fetchPayments = async (): Promise<PaymentRecord[]> => {
  await sleep(250);
  return structuredClone(mockPayments);
};

export const usePayments = () => {
  return useQuery({
    queryKey: paymentsQueryKey,
    queryFn: fetchPayments,
    staleTime: Number.POSITIVE_INFINITY,
  });
};
