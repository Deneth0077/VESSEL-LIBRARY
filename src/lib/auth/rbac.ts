import { IUser } from '@/types';

export function isAdmin(user?: IUser | null): boolean {
  return user?.role === 'ADMIN' && user?.status === 'APPROVED';
}

export function canManageVessel(user?: IUser | null, vesselCreatedBy?: string): boolean {
  if (!user || user.status !== 'APPROVED') return false;
  if (user.role === 'ADMIN') return true;
  if (!vesselCreatedBy) return true;

  const userIdStr = user._id ? String(user._id).trim().toLowerCase() : '';
  const empIdStr = user.employeeId ? String(user.employeeId).trim().toLowerCase() : '';
  const emailStr = user.email ? String(user.email).trim().toLowerCase() : '';
  const createdByStr = String(vesselCreatedBy).trim().toLowerCase();

  return (
    (userIdStr !== '' && userIdStr === createdByStr) ||
    (empIdStr !== '' && empIdStr === createdByStr) ||
    (emailStr !== '' && emailStr === createdByStr)
  );
}

export function canEditOrDeleteEntry(user?: IUser | null, entryCreatedBy?: string): boolean {
  if (!user || user.status !== 'APPROVED') return false;
  if (user.role === 'ADMIN') return true;
  if (!entryCreatedBy) return true;

  const userIdStr = user._id ? String(user._id).trim().toLowerCase() : '';
  const empIdStr = user.employeeId ? String(user.employeeId).trim().toLowerCase() : '';
  const emailStr = user.email ? String(user.email).trim().toLowerCase() : '';
  const fullNameStr = user.fullName ? String(user.fullName).trim().toLowerCase() : '';
  const createdByStr = String(entryCreatedBy).trim().toLowerCase();

  return (
    (userIdStr !== '' && userIdStr === createdByStr) ||
    (empIdStr !== '' && empIdStr === createdByStr) ||
    (emailStr !== '' && emailStr === createdByStr) ||
    (fullNameStr !== '' && fullNameStr === createdByStr)
  );
}
