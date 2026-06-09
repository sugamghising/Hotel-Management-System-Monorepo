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
  legalName?: string | null;
  brand?: string | null;
  contact: {
    email: string;
    phone: string;
    website: string | null;
    fax?: string | null;
  };
  operations: {
    checkInTime: string;
    checkOutTime: string;
    currencyCode: string;
    defaultLanguage?: string;
  };
  stats?: {
    roomTypesCount: number;
    roomsCount: number;
    todayArrivals: number;
    todayDepartures: number;
    inHouseGuests: number;
    occupancyRate: number;
  };
  configuration?: {
    policies?: Record<string, unknown>;
    operationalSettings?: Record<string, unknown>;
    amenities?: string[];
  };
  address?: {
    line1?: string;
    line2?: string | null;
    city?: string;
    stateProvince?: string | null;
    postalCode?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
  };
  dates?: {
    closingDate?: string | null;
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

  update: async (
    orgId: string,
    hotelId: string,
    input: Record<string, unknown>,
  ): Promise<void> => {
    await apiClient.patch(`/organizations/${orgId}/hotels/${hotelId}`, input);
  },

  updateSettings: async (
    orgId: string,
    hotelId: string,
    input: Record<string, unknown>,
  ): Promise<void> => {
    await apiClient.patch(
      `/organizations/${orgId}/hotels/${hotelId}/settings`,
      input,
    );
  },
};
