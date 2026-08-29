import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    employeeId: z.string().min(2, 'Employee ID must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    pin: z.string().regex(/^\d{4}$/, 'PIN must contain exactly 4 digits'),
    confirmPin: z.string(),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'PIN confirmation does not match',
    path: ['confirmPin'],
  });

export const loginSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must contain exactly 4 digits'),
});

export const adminLoginSchema = z.object({
  identifier: z.string().min(1, 'Email or Employee ID is required'),
  password: z.string().min(1, 'Password or PIN is required'),
});

export const photographSchema = z.object({
  url: z.string().min(1, 'Photo URL is required'),
  filename: z.string().min(1, 'Filename is required'),
  uploadedBy: z.string().min(1),
  uploadedByName: z.string().optional(),
  uploadedAt: z.union([z.string(), z.date()]).optional(),
  caption: z.string().optional(),
});

export const vesselSchema = z.object({
  vesselName: z.string().min(2, 'Vessel name is required'),
  vesselType: z.string().min(2, 'Vessel type is required'),
  imoNumber: z.string().optional(),
  flag: z.string().optional(),
  ownerOperator: z.string().optional(),
  callSign: z.string().optional(),
  yearBuilt: z.union([z.coerce.number(), z.string()]).optional(),
  loa: z.string().optional(),
  beam: z.string().optional(),
  keelToDeck: z.string().optional(),
  numberOfBays: z.string().optional(),
  numberOfRows: z.string().optional(),
  lashingBridges: z.string().optional(),
  lashingBridgeHeight: z.string().optional(),
  basicInformation: z.string().optional(),
  mainPhotographs: z.array(photographSchema).optional(),
});

export const vesselEntrySchema = z.object({
  section: z.enum(['STRUCTURE', 'STRUCTURAL_DAMAGE', 'OPERATIONAL_CHALLENGE', 'SPECIAL_NOTE', 'REMARK']),
  text: z.string().min(2, 'Description text is required'),
  photographs: z.array(photographSchema).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type VesselInput = z.infer<typeof vesselSchema>;
export type VesselEntryInput = z.infer<typeof vesselEntrySchema>;
