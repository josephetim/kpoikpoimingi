import type { Branch, Role } from '../types';

export const STAFF_DEFAULT_BRANCH: Branch = 'Abuja HQ';
export const STAFF_DEFAULT_BRANCH_STORAGE_KEY = 'kpo-staff-default-branch';

const isBranch = (value: string): value is Branch =>
  value === 'Abuja HQ' || value === 'Lagos' || value === 'Port Harcourt';

export const isSuperAdmin = (role: Role): boolean => role === 'Super Admin';

export const canAccessPayments = (role: Role): boolean => role === 'Super Admin';

export const canAccessReports = (role: Role): boolean => role === 'Super Admin';

export const canManageRiskActions = (role: Role): boolean => role !== 'Staff';

export const getStaffDefaultBranch = (): Branch => {
  if (typeof window === 'undefined') {
    return STAFF_DEFAULT_BRANCH;
  }

  const storedValue = window.localStorage.getItem(STAFF_DEFAULT_BRANCH_STORAGE_KEY);
  if (storedValue && isBranch(storedValue)) {
    return storedValue;
  }

  return STAFF_DEFAULT_BRANCH;
};

export const getVisibleBranches = (role: Role, preferredStaffBranch?: Branch): Branch[] => {
  if (role === 'Staff') {
    return [preferredStaffBranch ?? getStaffDefaultBranch()];
  }

  return ['Abuja HQ', 'Lagos', 'Port Harcourt'];
};
