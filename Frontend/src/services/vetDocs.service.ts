import api from './api';

export interface VetDoc {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  region?: 'North' | 'South' | 'East' | 'West';
  createdAt: string;
  updatedAt: string;
}

export interface CreateVetDocDto {
  name: string;
  specialty: string;
  phone: string;
  region?: string;
}

export interface UpdateVetDocDto extends Partial<CreateVetDocDto> {}

export const vetDocsService = {
  getAll: async (search?: string) => {
    const response = await api.get<VetDoc[]>('/vet-docs', {
      params: { search },
    });
    return response.data;
  },

  create: async (data: CreateVetDocDto) => {
    const response = await api.post<VetDoc>('/vet-docs', data);
    return response.data;
  },

  update: async (id: number, data: UpdateVetDocDto) => {
    const response = await api.put<VetDoc>(`/vet-docs/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/vet-docs/${id}`);
    return response.data;
  },
};
