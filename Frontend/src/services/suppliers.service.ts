import api from './api';

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  productType: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  contactPerson: string;
  phone: string;
  productType: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {}

export const suppliersService = {
  getAll: async (search?: string) => {
    const response = await api.get<Supplier[]>('/suppliers', {
      params: { search },
    });
    return response.data;
  },

  create: async (data: CreateSupplierDto) => {
    const response = await api.post<Supplier>('/suppliers', data);
    return response.data;
  },

  update: async (id: number, data: UpdateSupplierDto) => {
    const response = await api.put<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/suppliers/${id}`);
    return response.data;
  },
};
