import { UserRole } from '@generated/prisma/enums';

export const staffSearchableFields: string[] = ['name', 'email', 'phone'];

export const staffFilterableFields: string[] = ['search', 'role', 'status'];

// Every role that counts as staff — CUSTOMER is excluded from the staff list
export const staffRoles: UserRole[] = [
  UserRole.CASHIER,
  UserRole.KITCHEN,
  UserRole.MANAGER,
  UserRole.OWNER,
  UserRole.SUPER_ADMIN,
];

// Roles an owner may assign through the staff endpoints
export const assignableStaffRoles = [
  UserRole.CASHIER,
  UserRole.KITCHEN,
  UserRole.MANAGER,
  UserRole.OWNER,
] as const;
