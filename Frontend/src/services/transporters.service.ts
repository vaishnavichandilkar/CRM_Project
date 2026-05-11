import api from "./api";

export interface Transporter {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  vehicleType: 'Truck' | 'Van' | 'Bike' | 'Other';
  region: 'North' | 'South' | 'East' | 'West';
  createdAt: string;
}

export interface CreateTransporterDto {
  name: string;
  contactPerson: string;
  phone: string;
  vehicleType?: string;
  region?: string;
}

export interface UpdateTransporterDto extends Partial<CreateTransporterDto> {}

export const transportersService = {
  getAll: async (searchQuery?: string) => {
    const response = await api.get<Transporter[]>("/transporters", {
      params: { search: searchQuery },
    });
    return response.data;
  },

  create: async (data: CreateTransporterDto) => {
    const response = await api.post<Transporter>("/transporters", data);
    return response.data;
  },

  update: async (id: number, data: UpdateTransporterDto) => {
    const response = await api.patch<Transporter>(`/transporters/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/transporters/${id}`);
  },
};
