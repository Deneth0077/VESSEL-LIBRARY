import dbConnect from '@/lib/db/connect';
import AuditLog from '@/models/AuditLog';
import { UserRole } from '@/types';

export async function logAudit({
  userId,
  userName,
  userRole,
  action,
  target,
  metadata,
}: {
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await dbConnect();
    await AuditLog.create({
      userId,
      userName,
      userRole,
      action,
      target,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
