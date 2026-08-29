import { IUser } from '@/types';

export function isAdmin(user?: IUser | null): boolean {
  return user?.role === 'ADMIN' && user?.status === 'APPROVED';
}

export function canManageVessel(user?: IUser | null): boolean {
  return !!user && user.status === 'APPROVED';
}

export function canEditOrDeleteEntry(user?: IUser | null, entryCreatedBy?: string): boolean {
  if (!user || user.status !== 'APPROVED') return false;
  if (user.role === 'ADMIN') return true;
  if (!entryCreatedBy) return false;

  const userIdStr = user._id ? String(user._id) : '';
  const createdByStr = String(entryCreatedBy);

  return (
    (userIdStr !== '' && userIdStr === createdByStr) ||
    (!!user.employeeId && user.employeeId === createdByStr)
  );
}
