import { IUser } from '@/types';

export function isAdmin(user?: IUser | null): boolean {
  return user?.role === 'ADMIN' && user?.status === 'APPROVED';
}

export function canManageVessel(user?: IUser | null, vesselCreatedBy?: string): boolean {
  if (!user || user.status !== 'APPROVED') return false;
  if (user.role === 'ADMIN') return true;
  if (!vesselCreatedBy) return true;

  const rawId = user._id || (user as any).id;
  const userIdStr = rawId ? String(rawId).trim().toLowerCase() : '';
  const empIdStr = user.employeeId ? String(user.employeeId).trim().toLowerCase() : '';
  const emailStr = user.email ? String(user.email).trim().toLowerCase() : '';
  const fullNameStr = user.fullName ? String(user.fullName).trim().toLowerCase() : '';
  const createdByStr = String(vesselCreatedBy).trim().toLowerCase();

  return (
    (userIdStr !== '' && userIdStr === createdByStr) ||
    (empIdStr !== '' && empIdStr === createdByStr) ||
    (emailStr !== '' && emailStr === createdByStr) ||
    (fullNameStr !== '' && fullNameStr === createdByStr)
  );
}

export function canEditOrDeleteEntry(
  user?: IUser | null,
  entryCreatedBy?: string,
  entryCreatedByName?: string
): boolean {
  if (!user || user.status !== 'APPROVED') return false;
  if (user.role === 'ADMIN') return true;
  if (!entryCreatedBy && !entryCreatedByName) return true;

  const rawId = user._id || (user as any).id;
  const userIdStr = rawId ? String(rawId).trim().toLowerCase() : '';
  const empIdStr = user.employeeId ? String(user.employeeId).trim().toLowerCase() : '';
  const emailStr = user.email ? String(user.email).trim().toLowerCase() : '';
  const fullNameStr = user.fullName ? String(user.fullName).trim().toLowerCase() : '';

  const createdByStr = entryCreatedBy ? String(entryCreatedBy).trim().toLowerCase() : '';
  const createdByNameStr = entryCreatedByName ? String(entryCreatedByName).trim().toLowerCase() : '';

  return (
    (userIdStr !== '' && createdByStr !== '' && userIdStr === createdByStr) ||
    (empIdStr !== '' && createdByStr !== '' && empIdStr === createdByStr) ||
    (emailStr !== '' && createdByStr !== '' && emailStr === createdByStr) ||
    (fullNameStr !== '' && createdByStr !== '' && fullNameStr === createdByStr) ||
    (fullNameStr !== '' && createdByNameStr !== '' && fullNameStr === createdByNameStr)
  );
}
