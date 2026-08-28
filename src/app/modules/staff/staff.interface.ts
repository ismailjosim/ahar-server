import type { UserRole, UserStatus } from '@generated/prisma/enums';

export type IStaffFilterRequest = {
  search?: string | undefined;
  role?: UserRole | undefined;
  status?: UserStatus | undefined;
};
