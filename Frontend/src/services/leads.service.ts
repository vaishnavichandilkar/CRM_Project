import api from './api';

export type LeadSource = 'Meta Ads' | 'Google Ads' | 'Referral' | 'Walk-in' | 'Existing Customer' | 'Outbound';
export type LeadStatus = 'Open' | 'In Progress' | 'Won' | 'Lost';

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  assignedToId: number;
  assignedTo: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone: string;
  source: string;
  assignedToId: number;
  notes?: string;
}

export const leadsService = {
  getAllLeads: async () => {
    const response = await api.get<Lead[]>('/leads');
    return response.data;
  },

  getSalesReps: async () => {
    const response = await api.get<{ id: number; name: string }[]>('/leads/eligible-staff');
    return response.data;
  },

  createLead: async (data: CreateLeadDto) => {
    const response = await api.post<Lead>('/leads', data);
    return response.data;
  },

  updateLead: async (id: number, data: Partial<CreateLeadDto> & { status?: string }) => {
    const response = await api.patch<Lead>(`/leads/${id}`, data);
    return response.data;
  },
};
