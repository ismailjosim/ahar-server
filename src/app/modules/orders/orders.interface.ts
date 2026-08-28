export type IOrderFilterRequest = {
  search?: string | undefined;
  // Client-facing label (e.g. 'Preparing'), mapped through orders.utils#toDbOrderStatus
  status?: string | undefined;
};
