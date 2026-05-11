import api from './api';

export interface SHG {
  id: number;
  name: string;
  leader: string;
  members: number;
  region?: 'North' | 'South' | 'East' | 'West';
  activity: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSHGDto {
  name: string;
  leader: string;
  members: number;
  region?: string;
  activity: string;
}

export interface UpdateSHGDto extends Partial<CreateSHGDto> {}

export const shgService = {
  getAll: async (search?: string) => {
    const response = await api.get<SHG[]>('/shg', {
      params: { search },
    });
    return response.data;
  },

  create: async (data: CreateSHGDto) => {
    const response = await api.post<SHG>('/shg', data);
    return response.data;
  },

  update: async (id: number, data: UpdateSHGDto) => {
    const response = await api.put<SHG>(`/shg/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/shg/${id}`);
    return response.data;
  },
};
