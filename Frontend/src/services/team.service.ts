import api from "./api";

export interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  region: 'North' | 'South' | 'East' | 'West';
  status: 'ACTIVE' | 'INACTIVE';
  role: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface CreateTeamMemberDto {
  fullName: string;
  email: string;
  roleId: number;
  region: string;
}

export interface UpdateTeamMemberDto extends Partial<CreateTeamMemberDto> {
  status?: 'ACTIVE' | 'INACTIVE';
}

export const teamService = {
  getAll: async (searchQuery?: string) => {
    const response = await api.get<TeamMember[]>("/team", {
      params: { search: searchQuery },
    });
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get<Role[]>("/roles");
    return response.data;
  },

  create: async (data: CreateTeamMemberDto) => {
    const response = await api.post<TeamMember>("/team", data);
    return response.data;
  },

  update: async (id: number, data: UpdateTeamMemberDto) => {
    const response = await api.patch<TeamMember>(`/team/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/team/${id}`);
  },
};
