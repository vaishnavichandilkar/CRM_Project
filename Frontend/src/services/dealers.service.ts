import api from './api';

export interface Dealer {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  region?: 'North' | 'South' | 'East' | 'West';
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealerDto {
  name: string;
  contactPerson: string;
  phone: string;
  region?: string;
}

export interface UpdateDealerDto extends Partial<CreateDealerDto> {}

export const dealersService = {
  getAll: async (search?: string) => {
    const response = await api.get<Dealer[]>('/dealers', {
      params: { search },
    });
    return response.data;
  },

  create: async (data: CreateDealerDto) => {
    const response = await api.post<Dealer>('/dealers', data);
    return response.data;
  },

  update: async (id: number, data: UpdateDealerDto) => {
    const response = await api.put<Dealer>(`/dealers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/dealers/${id}`);
    return response.data;
  },
};
