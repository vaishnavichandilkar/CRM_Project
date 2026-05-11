import api from "./api";

export interface ContentPlan {
  id: number;
  campaignTitle: string;
  platform?: 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'TWITTER' | 'YOUTUBE';
  startDate: string;
  endDate: string;
  createdAt: string;
}

export const contentPlansService = {
  getAll: (search?: string) => api.get<ContentPlan[]>("/content-plans", { params: { search } }).then(r => r.data),
  create: (data: any) => api.post<ContentPlan>("/content-plans", data).then(r => r.data),
  update: (id: number, data: any) => api.put<ContentPlan>(`/content-plans/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/content-plans/${id}`).then(r => r.data),
};
