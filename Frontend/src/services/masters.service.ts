import api from "./api";

// 1. Dealers Service
export interface Dealer {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  region?: 'North' | 'South' | 'East' | 'West';
  createdAt: string;
}

export const dealersService = {
  getAll: (search?: string) => api.get<Dealer[]>("/dealers", { params: { search } }).then(r => r.data),
  create: (data: any) => api.post<Dealer>("/dealers", data).then(r => r.data),
  update: (id: number, data: any) => api.patch<Dealer>(`/dealers/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/dealers/${id}`),
};

// 2. Suppliers Service
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
  update: (id: number, data: any) => api.patch<Supplier>(`/suppliers/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};

// 3. Vet Docs Service
export interface VetDoc {
  id: number;
  doctorName: string;
  specialty: string;
  phone: string;
  region?: 'North' | 'South' | 'East' | 'West';
  createdAt: string;
}

export const vetDocsService = {
  getAll: (search?: string) => api.get<VetDoc[]>("/vet-docs", { params: { search } }).then(r => r.data),
  create: (data: any) => api.post<VetDoc>("/vet-docs", data).then(r => r.data),
  update: (id: number, data: any) => api.patch<VetDoc>(`/vet-docs/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/vet-docs/${id}`),
};

// 4. SHG Service
export interface SHG {
  id: number;
  groupName: string;
  leaderName: string;
  numberOfMembers: number;
  activity: string;
  region?: 'North' | 'South' | 'East' | 'West';
  createdAt: string;
}

export const shgService = {
  getAll: (search?: string) => api.get<SHG[]>("/shg", { params: { search } }).then(r => r.data),
  create: (data: any) => api.post<SHG>("/shg", data).then(r => r.data),
  update: (id: number, data: any) => api.patch<SHG>(`/shg/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/shg/${id}`),
};
