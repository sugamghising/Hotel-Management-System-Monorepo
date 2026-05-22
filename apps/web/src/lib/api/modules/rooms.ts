// apps/web/src/lib/api/modules/rooms.ts
import { apiClient } from '../client';

export interface Room {
  id: string;
  organizationId: string;
  hotelId: string;
  identification: {
    roomNumber: string;
    floor: number | null;
    building: string | null;
    wing: string | null;
    fullLocation: string;
  };
  type: {
    id: string;
    code: string;
    name: string;
    baseOccupancy: number;
    maxOccupancy: number;
  };
  status: {
    current: string;
    isOutOfOrder: boolean;
    oooDetails: {
      reason: string | null;
      from: string | null;
      until: string | null;
    } | null;
    lastCleanedAt: string | null;
    cleaningPriority: number;
    maintenanceStatus: string;
  };
  features: {
    isSmoking: boolean;
    isAccessible: boolean;
    viewType: string | null;
  };
  financial: {
    rackRate: number | null;
  };
  currentReservation?: {
    id: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    nights: number;
  } | null;
}

export interface RoomGridFloor {
  floor: number | null;
  rooms: Array<{
    id: string;
    roomNumber: string;
    status: string;
    roomTypeCode: string;
    roomTypeName: string;
    isOutOfOrder: boolean;
    cleaningPriority: number;
    currentGuest?: string;
    nextArrival?: string;
  }>;
}

export interface RoomGrid {
  floors: RoomGridFloor[];
  stats: {
    total: number;
    vacantClean: number;
    vacantDirty: number;
    occupied: number;
    outOfOrder: number;
  };
}

export const roomsApi = {
  list: async (
    orgId: string,
    hotelId: string,
    params?: any
  ): Promise<{ rooms: Room[]; pagination: any }> => {
    const { data } = await apiClient.get(`/${orgId}/hotels/${hotelId}/rooms`, { params });
    return data.data;
  },

  getGrid: async (orgId: string, hotelId: string): Promise<{ grid: RoomGrid }> => {
    const { data } = await apiClient.get(`/${orgId}/hotels/${hotelId}/rooms/grid`);
    return data.data;
  },

  getById: async (orgId: string, hotelId: string, roomId: string): Promise<{ room: Room }> => {
    const { data } = await apiClient.get(
      `/${orgId}/hotels/${hotelId}/rooms/${roomId}?reservations=true`
    );
    return data.data;
  },

  updateStatus: async (
    orgId: string,
    hotelId: string,
    roomId: string,
    status: string
  ): Promise<void> => {
    await apiClient.post(`/${orgId}/hotels/${hotelId}/rooms/${roomId}/status`, { status });
  },

  bulkUpdateStatus: async (
    orgId: string,
    hotelId: string,
    roomIds: string[],
    status: string
  ): Promise<void> => {
    await apiClient.post(`/${orgId}/hotels/${hotelId}/rooms/bulk-status`, {
      roomIds,
      status,
    });
  },

  findAvailable: async (
    orgId: string,
    hotelId: string,
    params: { checkIn: string; checkOut: string; roomTypeId?: string }
  ): Promise<{ rooms: Room[] }> => {
    const { data } = await apiClient.get(`/${orgId}/hotels/${hotelId}/rooms/available`, {
      params,
    });
    return data.data;
  },
};