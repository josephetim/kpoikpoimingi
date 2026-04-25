import { useQuery } from '@tanstack/react-query';
import { mockCustomers } from '../data/mockCustomers';
import type { Customer } from '../types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const customersQueryKey = ['customers'] as const;

const fetchCustomers = async (): Promise<Customer[]> => {
  await sleep(250);
  return structuredClone(mockCustomers);
};

export const useCustomers = () => {
  return useQuery({
    queryKey: customersQueryKey,
    queryFn: fetchCustomers,
    staleTime: Number.POSITIVE_INFINITY,
  });
};
