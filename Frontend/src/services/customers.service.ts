import api from "./api";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  region: 'North' | 'South' | 'East' | 'West';
  type: 'Retail' | 'Wholesale';
  address?: string;
  createdAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  region: string;
  type: string;
  address?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export const customersService = {
  getAll: (searchQuery?: string) =>
    api.get<Customer[]>("/customers", { params: { search: searchQuery } }).then((r) => r.data),
  
  create: (data: CreateCustomerDto) =>
    api.post<Customer>("/customers", data).then((r) => r.data),
  
  update: (id: number, data: UpdateCustomerDto) =>
    api.put<Customer>(`/customers/${id}`, data).then((r) => r.data),
  
  delete: (id: number) =>
    api.delete(`/customers/${id}`).then((r) => r.data),
};
