import api from "./api";

// Dealers Service
export interface Dealer {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  region?: string;
  createdAt: string;
}

export const dealersService = {
  getAll: (search?: string) => api.get<Dealer[]>("/dealers", { params: { search } }).then(r => r.data),
  create: (data: any) => api.post<Dealer>("/dealers", data).then(r => r.data),
  update: (id: number, data: any) => api.put<Dealer>(`/dealers/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/dealers/${id}`).then(r => r.data),
};

// Suppliers Service
export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  productType: string;
  createdAt: string;
}

export const suppliersService = {
  getAll: (search?: string) => api.get<Supplier[]>("/suppliers", { params: { search } }).then(r => r.data),
  create: (data: any) => api.post<Supplier>("/suppliers", data).then(r => r.data),
  update: (id: number, data: any) => api.put<Supplier>(`/suppliers/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/suppliers/${id}`).then(r => r.data),
};

// Vet Docs Service
export interface VetDoc {
  id: number;
  doctorName: string;
  specialty: string;
  phone: string;
  region?: string;
  createdAt: string;
}

export const vetDocsService = {
  getAll: (search?: string) => api.get<VetDoc[]>("/vet-docs", { params: { search } }).then(r => r.data),
  create: (data: any) => api.post<VetDoc>("/vet-docs", data).then(r => r.data),
  update: (id: number, data: any) => api.put<VetDoc>(`/vet-docs/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/vet-docs/${id}`).then(r => r.data),
};

// SHG Service
export interface SHG {
  id: number;
  groupName: string;
  leaderName: string;
  numberOfMembers: number;
  region?: string;
  activity: string;
  createdAt: string;
}

export const shgService = {
  getAll: (search?: string) => api.get<SHG[]>("/shg", { params: { search } }).then(r => r.data),
  create: (data: any) => api.post<SHG>("/shg", data).then(r => r.data),
  update: (id: number, data: any) => api.put<SHG>(`/shg/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/shg/${id}`).then(r => r.data),
};

// Dynamic Masters Service
export interface MasterConfig {
  id: number;
  name: string;
  slug: string;
  config: any[];
}

export interface MasterRecord {
  id: number;
  [key: string]: any;
}

export const dynamicMastersService = {
  getAllConfigs: () => api.get<MasterConfig[]>("/masters/configs").then(r => r.data),
  getConfig: (slug: string) => api.get<MasterConfig>(`/masters/config/${slug}`).then(r => r.data),
  createConfig: (data: any) => api.post<MasterConfig>("/masters/config", data).then(r => r.data),
  updateConfig: (slug: string, data: any) => api.put<MasterConfig>(`/masters/config/${slug}`, data).then(r => r.data),
  deleteConfig: (slug: string) => api.delete(`/masters/config/${slug}`).then(r => r.data),
  getRecords: (slug: string, params?: { search?: string; page?: number; limit?: number }) => 
    api.get<{ records: MasterRecord[]; total: number }> (`/masters/records/${slug}`, { params }).then(r => r.data),

  createRecord: (slug: string, data: any) => api.post<MasterRecord>(`/masters/record/${slug}`, data).then(r => r.data),
  updateRecord: (id: number, data: any) => api.put<MasterRecord>(`/masters/record/${id}`, data).then(r => r.data),
  deleteRecord: (id: number) => api.delete(`/masters/record/${id}`).then(r => r.data),
};

