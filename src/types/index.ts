export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'SUSPENDED';

export interface IUser {
  _id: string;
  fullName: string;
  employeeId: string;
  email: string;
  pinHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastLoginAt?: string | Date;
  approvedAt?: string | Date;
  approvedBy?: string;
  deniedAt?: string | Date;
  deniedBy?: string;
}

export interface IPhotograph {
  _id?: string;
  url: string;
  filename: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt?: string | Date;
  caption?: string;
}

export interface IVessel {
  _id: string;
  vesselName: string;
  vesselType: string;
  imoNumber?: string;
  flag?: string;
  ownerOperator?: string;
  callSign?: string;
  yearBuilt?: number;
  loa?: string;
  beam?: string;
  keelToDeck?: string;
  numberOfBays?: string;
  numberOfRows?: string;
  lashingBridges?: 'Yes' | 'No' | '';
  lashingBridgeHeight?: string;
  basicInformation?: string;
  mainPhotographs: IPhotograph[];
  createdBy: string;
  updatedBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type SectionType = 
  | 'STRUCTURE'
  | 'STRUCTURAL_DAMAGE'
  | 'OPERATIONAL_CHALLENGE'
  | 'SPECIAL_NOTE'
  | 'REMARK';

export interface IVesselEntry {
  _id: string;
  vesselId: string;
  section: SectionType;
  text: string;
  solution?: string;
  photographs: IPhotograph[];
  createdBy: string;
  createdByName: string;
  updatedBy: string;
  updatedByName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ILoginHistory {
  _id: string;
  userId?: string;
  employeeId: string;
  loginAt: string | Date;
  logoutAt?: string | Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
}

export interface IAuditLog {
  _id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target?: string;
  metadata?: Record<string, any>;
  timestamp: string | Date;
}

export interface JWTPayload {
  userId: string;
  employeeId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
}
