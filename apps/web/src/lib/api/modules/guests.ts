import { apiClient } from "../client";

export interface Guest {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  guestType: string;
  vipStatus: string;
  companyName: string | null;
  totalStays: number;
  totalNights: number;
  totalRevenue: number;
  lastStayDate: string | null;
  alertNotes: string | null;
  createdAt: string;
}

export const guestsApi = {
  list: async (
    orgId: string,
    params?: {
      search?: string;
      vipStatus?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ guests: Guest[]; pagination: any }> => {
    const { data } = await apiClient.get(`/${orgId}/guests`, { params });
    return data.data;
  },

  getById: async (orgId: string, id: string): Promise<Guest> => {
    const { data } = await apiClient.get(`/${orgId}/guests/${id}`);
    return data.data.guest;
  },

  create: async (orgId: string, payload: any): Promise<Guest> => {
    const { data } = await apiClient.post(`/${orgId}/guests`, payload);
    return data.data.guest;
  },

  update: async (orgId: string, id: string, payload: any): Promise<Guest> => {
    const { data } = await apiClient.patch(`/${orgId}/guests/${id}`, payload);
    return data.data.guest;
  },

  getHistory: async (orgId: string, id: string): Promise<any[]> => {
    const { data } = await apiClient.get(`/${orgId}/guests/${id}/history`);
    return data.data.reservations ?? [];
  },
};
