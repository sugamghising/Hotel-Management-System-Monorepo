import { apiClient } from "../client";

export interface Hotel {
  id: string;
  code: string;
  name: string;
  propertyType: string;
  starRating: number | null;
  city: string;
  countryCode: string;
  status: string;
  currencyCode: string;
  timezone: string;
  totalRooms: number;
  contact: {
    email: string;
    phone: string;
    website: string | null;
  };
  operations: {
    checkInTime: string;
    checkOutTime: string;
    currencyCode: string;
  };
  stats?: {
    roomTypesCount: number;
    roomsCount: number;
    todayArrivals: number;
    todayDepartures: number;
    inHouseGuests: number;
    occupancyRate: number;
  };
}

export const hotelsApi = {
  list: async (orgId: string): Promise<{ hotels: Hotel[] }> => {
    const { data } = await apiClient.get(`/organizations/${orgId}/hotels`);
    return data.data;
  },

  getById: async (
    orgId: string,
    hotelId: string,
  ): Promise<{ hotel: Hotel }> => {
    const { data } = await apiClient.get(
      `/organizations/${orgId}/hotels/${hotelId}?stats=true`,
    );
    return data.data;
  },

  getDashboard: async (orgId: string, hotelId: string) => {
    const { data } = await apiClient.get(
      `/${orgId}/hotels/${hotelId}/dashboard`,
    );
    return data.data.dashboard;
  },
};
