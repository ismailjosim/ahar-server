import type { CategoryStatus } from '@generated/prisma/enums';

export type ICategoryFilterRequest = {
  search?: string | undefined;
  status?: CategoryStatus | 'all' | undefined;
};
