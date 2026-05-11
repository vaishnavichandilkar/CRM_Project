import api from "./api";

export interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  region: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
  status: 'ACTIVE' | 'INACTIVE';
  role: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface CreateTeamMemberDto {
  fullName: string;
  email: string;
  role: string;
  region: string;
}

export interface UpdateTeamMemberDto extends Partial<CreateTeamMemberDto> {
  status?: 'ACTIVE' | 'INACTIVE';
}

export const teamService = {
  getAll: (searchQuery?: string) =>
    api.get<TeamMember[]>("/team", { params: { search: searchQuery } }).then((r) => r.data),
  
  create: (data: CreateTeamMemberDto) =>
    api.post<TeamMember>("/team", data).then((r) => r.data),
  
  update: (id: number, data: UpdateTeamMemberDto) =>
    api.put<TeamMember>(`/team/${id}`, data).then((r) => r.data),
  
  delete: (id: number) =>
    api.delete(`/team/${id}`).then((r) => r.data),
};
