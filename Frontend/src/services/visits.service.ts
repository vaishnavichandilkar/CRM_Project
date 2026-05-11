import api from './api';

export enum VisitStatus {
  Scheduled = 'Scheduled',
  Completed = 'Completed',
  Follow_up = 'Follow_up',
  Cancelled = 'Cancelled',
}

export interface Visit {
  id: number;
  visitDate: string;
  status: VisitStatus;
  petrolAllowance: number;
  location: string;
  notes?: string;
  customerId: number;
  userId: number;
  customer: { id: number; name: string };
  user: { id: number; firstName: string; lastName: string };
  createdAt: string;
}

export interface VisitMetadata {
  customers: { id: number; name: string }[];
  salesReps: { id: number; name: string }[];
}

export interface VisitStats {
  totalScheduled: number;
  completedToday: number;
  followUps: number;
  totalAllowance: number;
}

export interface CreateVisitDto {
  visitDate: string;
  status?: VisitStatus;
  petrolAllowance: number;
  location: string;
  notes?: string;
  customerId: number;
  userId: number;
}

export const visitsService = {
  getVisits: async () => {
    const response = await api.get<Visit[]>('/visits');
    return response.data;
  },

  getVisitMetadata: async () => {
    const response = await api.get<VisitMetadata>('/visits/metadata');
    return response.data;
  },

  getVisitStats: async () => {
    const response = await api.get<VisitStats>('/visits/stats');
    return response.data;
  },

  createVisit: async (data: CreateVisitDto) => {
    const response = await api.post<Visit>('/visits', data);
    return response.data;
  },

  updateStatus: async (id: number, status: VisitStatus) => {
    const response = await api.patch<Visit>(`/visits/${id}/status`, { status });
    return response.data;
  },
};
