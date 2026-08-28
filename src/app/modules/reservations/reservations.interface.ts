export type IReservationFilterRequest = {
  search?: string | undefined;
  // Client-facing label (e.g. 'Pending'), mapped through reservations.service#toStatus
  status?: string | undefined;
};
