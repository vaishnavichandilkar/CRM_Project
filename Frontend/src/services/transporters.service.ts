import api from "./api";

export interface Transporter {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  vehicleType?: 'TRUCK' | 'VAN' | 'BIKE' | 'OTHER';
  region?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
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
  getAll: (searchQuery?: string) =>
    api.get<Transporter[]>("/transporters", { params: { search: searchQuery } }).then((r) => r.data),
  
  create: (data: CreateTransporterDto) =>
    api.post<Transporter>("/transporters", data).then((r) => r.data),
  
  update: (id: number, data: UpdateTransporterDto) =>
    api.put<Transporter>(`/transporters/${id}`, data).then((r) => r.data),
  
  delete: (id: number) =>
    api.delete(`/transporters/${id}`).then((r) => r.data),
};
