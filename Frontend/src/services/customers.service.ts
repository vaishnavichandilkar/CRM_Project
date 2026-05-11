import api from "./api";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  region: 'North' | 'South' | 'East' | 'West';
  customerType: 'Retail' | 'Wholesale';
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  region: string;
  customerType: string;
  address?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export const customersService = {
  getAll: async (searchQuery?: string) => {
    const response = await api.get<Customer[]>("/customers", {
      params: { search: searchQuery },
    });
    return response.data;
  },

  create: async (data: CreateCustomerDto) => {
    const response = await api.post<Customer>("/customers", data);
    return response.data;
  },

  update: async (id: number, data: UpdateCustomerDto) => {
    const response = await api.patch<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/customers/${id}`);
  },
};
