import api from "./api";

export interface ContentPlan {
  id: number;
  campaignTitle: string;
  platform?: 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter' | 'YouTube';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentPlanDto {
  campaignTitle: string;
  platform?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateContentPlanDto extends Partial<CreateContentPlanDto> {}

export const contentPlansService = {
  getAll: async (searchQuery?: string) => {
    const response = await api.get<ContentPlan[]>("/content-plans", {
      params: { search: searchQuery },
    });
    return response.data;
  },

  create: async (data: CreateContentPlanDto) => {
    const response = await api.post<ContentPlan>("/content-plans", data);
    return response.data;
  },

  update: async (id: number, data: UpdateContentPlanDto) => {
    const response = await api.patch<ContentPlan>(`/content-plans/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/content-plans/${id}`);
  },
};
