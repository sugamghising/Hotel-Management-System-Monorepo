import { apiClient } from "../client";

export interface Reservation {
  id: string;
  confirmationNumber: string;
  externalRef: string | null;
  status: {
    reservation:
      | "PENDING"
      | "CONFIRMED"
      | "CHECKED_IN"
      | "CHECKED_OUT"
      | "CANCELLED"
      | "NO_SHOW"
      | "WAITLIST";
    checkIn:
      | "NOT_CHECKED_IN"
      | "EARLY_CHECK_IN"
      | "CHECKED_IN"
      | "LATE_CHECK_OUT"
      | "CHECKED_OUT";
  };
  dates: {
    checkIn: string;
    checkOut: string;
    arrivalTime: string | null;
    departureTime: string | null;
    nights: number;
  };
  guests: {
    primaryGuestId: string;
    primaryGuestName: string;
    adultCount: number;
    childCount: number;
    infantCount: number;
    totalGuests: number;
  };
  rooms: Array<{
    id: string;
    roomTypeId: string;
    roomTypeName: string;
    roomTypeCode: string;
    roomId: string | null;
    roomNumber: string | null;
    status: string;
    roomRate: number;
    assignedAt: string | null;
    checkInAt: string | null;
    checkOutAt: string | null;
  }>;
  financial: {
    currencyCode: string;
    nightlyRates: Array<{
      date: string;
      rate: number;
      tax: number;
      total: number;
    }>;
    averageRate: number;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    balance: number;
  };
  source: {
    bookingSource: string;
    channelCode: string | null;
    bookedAt: string;
    bookedBy: string;
  };
  policies: {
    cancellationPolicy: string;
    guaranteeType: string;
    guaranteeAmount: number | null;
  };
  notes: {
    guestNotes: string | null;
    specialRequests: string | null;
    internalNotes: string | null;
  };
  cancellation: {
    cancelledAt: string;
    cancelledBy: string;
    reason: string;
    fee: number;
  } | null;
  createdAt: string;
  modifiedAt: string;
}

export interface ReservationListItem {
  id: string;
  confirmationNumber: string;
  guestName: string;
  status: Reservation["status"]["reservation"];
  checkInStatus: Reservation["status"]["checkIn"];
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomType: string;
  roomNumber: string | null;
  totalAmount: number;
  balance: number;
  source: string;
}

export interface DashboardStats {
  today: {
    date: string;
    arrivals: number;
    departures: number;
    inHouse: number;
    occupancyPercent: number;
  };
  roomStatus: {
    vacantClean: number;
    vacantDirty: number;
    occupiedClean: number;
    occupiedDirty: number;
    outOfOrder: number;
  };
  alerts: Array<{
    type: "WARNING" | "CRITICAL" | "INFO";
    message: string;
    entityType?: string;
  }>;
}

export const reservationsApi = {
  list: async (
    orgId: string,
    hotelId: string,
    params?: {
      status?: string;
      checkInFrom?: string;
      checkInTo?: string;
      guestName?: string;
      confirmationNumber?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ reservation: ReservationListItem[]; pagination: any }> => {
    const { data } = await apiClient.get(
      `/${orgId}/hotels/${hotelId}/reservations`,
      { params },
    );
    return data.data;
  },

  getById: async (
    orgId: string,
    hotelId: string,
    id: string,
  ): Promise<Reservation> => {
    const { data } = await apiClient.get(
      `/${orgId}/hotels/${hotelId}/reservations/${id}`,
    );
    return data.data.reservation;
  },

  todayArrivals: async (
    orgId: string,
    hotelId: string,
  ): Promise<Reservation[]> => {
    const { data } = await apiClient.get(
      `/${orgId}/hotels/${hotelId}/reservations/today/arrivals`,
    );
    return data.data.reservations;
  },

  todayDepartures: async (
    orgId: string,
    hotelId: string,
  ): Promise<Reservation[]> => {
    const { data } = await apiClient.get(
      `/${orgId}/hotels/${hotelId}/reservations/today/departures`,
    );
    return data.data.reservations;
  },

  inHouse: async (orgId: string, hotelId: string): Promise<any[]> => {
    const { data } = await apiClient.get(
      `/${orgId}/hotels/${hotelId}/reservations/in-house`,
    );
    return data.data.guests;
  },

  create: async (
    orgId: string,
    hotelId: string,
    payload: any,
  ): Promise<Reservation> => {
    const { data } = await apiClient.post(
      `/${orgId}/hotels/${hotelId}/reservations`,
      payload,
    );
    return data.data.reservation;
  },

  update: async (
    orgId: string,
    hotelId: string,
    id: string,
    payload: any,
  ): Promise<Reservation> => {
    const { data } = await apiClient.patch(
      `/${orgId}/hotels/${hotelId}/reservations/${id}`,
      payload,
    );
    return data.data.reservation;
  },

  checkIn: async (
    orgId: string,
    hotelId: string,
    id: string,
    payload: { roomId?: string; earlyCheckIn?: boolean },
  ): Promise<Reservation> => {
    const { data } = await apiClient.post(
      `/${orgId}/hotels/${hotelId}/reservations/${id}/check-in`,
      payload,
    );
    return data.data.reservation;
  },

  checkOut: async (
    orgId: string,
    hotelId: string,
    id: string,
    payload: { lateCheckOut?: boolean },
  ): Promise<Reservation> => {
    const { data } = await apiClient.post(
      `/${orgId}/hotels/${hotelId}/reservations/${id}/check-out`,
      payload,
    );
    return data.data.reservation;
  },

  cancel: async (
    orgId: string,
    hotelId: string,
    id: string,
    payload: { reason: string; waiveFee: boolean },
  ): Promise<Reservation> => {
    const { data } = await apiClient.post(
      `/${orgId}/hotels/${hotelId}/reservations/${id}/cancel`,
      payload,
    );
    return data.data.reservation;
  },

  assignRoom: async (
    orgId: string,
    hotelId: string,
    id: string,
    payload: { roomId: string; force?: boolean },
  ): Promise<Reservation> => {
    const { data } = await apiClient.post(
      `/${orgId}/hotels/${hotelId}/reservations/${id}/assign-room`,
      payload,
    );
    return data.data.reservation;
  },

  markNoShow: async (
    orgId: string,
    hotelId: string,
    id: string,
    payload: { chargeNoShowFee: boolean },
  ): Promise<Reservation> => {
    const { data } = await apiClient.post(
      `/${orgId}/hotels/${hotelId}/reservations/${id}/no-show`,
      payload,
    );
    return data.data.reservation;
  },
};
