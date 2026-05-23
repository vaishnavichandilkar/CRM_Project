import api from '../../services/api';

export type LeadSource = 'Meta Ads' | 'Google Ads' | 'Referral' | 'Website' | 'Other';
export type LeadStatus = 'Open' | 'In Progress' | 'Won' | 'Lost';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type CallType = 'Inbound' | 'Outbound';

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  assignedToId: number;
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  lastConversation?: string;
  createdAt: string;
}

export interface Task {
  id: number;
  subject: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  description?: string;
  leadId: number;
}

export interface Call {
  id: number;
  callType: CallType;
  startTime: string;
  duration?: number;
  voiceRecordingUrl?: string;
  notes?: string;
  leadId: number;
  ownerId: number;
}

export interface CreateLeadDto {
  name: string;
  email?: string;
  phone: string;
  source: LeadSource;
  assignedToId?: number;
  notes?: string;
}

export interface LeadStats {
  Open: number;
  'In Progress': number;
  Won: number;
  Lost: number;
}

export const leadsService = {
  getAllLeads: async () => {
    const response = await api.get<Lead[]>('/leads');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<LeadStats>('/leads/stats');
    return response.data;
  },

  getLeadDetails: async (id: number) => {
    const response = await api.get<Lead & { upcomingTasks: Task[] }>(`/leads/${id}`);
    return response.data;
  },

  createLead: async (data: CreateLeadDto) => {
    const response = await api.post<Lead>('/leads', data);
    return response.data;
  },

  updateLeadStatus: async (id: number, status: LeadStatus) => {
    const response = await api.patch<Lead>(`/leads/${id}/status`, { status });
    return response.data;
  },

  scheduleCall: async (data: Omit<Call, 'id' | 'ownerId'>) => {
    const response = await api.post<Call>('/leads/calls', data);
    return response.data;
  },

  createTask: async (data: Omit<Task, 'id'>) => {
    const response = await api.post<Task>('/leads/tasks', data);
    return response.data;
  },

  getEligibleStaff: async () => {
    const response = await api.get<{ id: number; firstName: string; lastName: string }[]>('/users');
    return response.data;
  },

  getCustomersDropdown: async () => {
    const response = await api.get<{ id: number; customerCode: string; name: string; phone: string; type?: string }[]>('/customers/dropdown');
    return response.data;
  },

  getCustomerDetails: async (id: number) => {
    const response = await api.get<any>(`/customers/${id}`);
    return response.data;
  },

  getProductsDropdown: async () => {
    const response = await api.get<{ id: number; sku: string; name: string; price: number; customerRate: number; dealerRate: number; quantity: string }[]>('/products/dropdown');
    return response.data;
  },

  getProductDetails: async (id: number) => {
    const response = await api.get<any>(`/products/${id}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get<any>('/leads/dashboard/stats');
    return response.data;
  },

  createFollowup: async (leadId: number, data: any) => {
    const response = await api.post<any>(`/leads/${leadId}/followups`, data);
    return response.data;
  },

  getFollowups: async (leadId: number) => {
    const response = await api.get<any[]>(`/leads/${leadId}/followups`);
    return response.data;
  },

  updateLead: async (id: number, data: any) => {
    const response = await api.patch<any>(`/leads/${id}`, data);
    return response.data;
  },

  updateLeadStatusWithRemarks: async (id: number, status: string, remarks?: string) => {
    const response = await api.patch<any>(`/leads/${id}/status`, { status, remarks });
    return response.data;
  },
};
