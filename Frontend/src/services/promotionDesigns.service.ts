import api from "./api";

export interface PromotionDesign {
  id: number;
  designTitle: string;
  type?: 'BANNER' | 'FLYER' | 'SOCIAL_POST' | 'EMAIL_TEMPLATE' | 'POSTER';
  status: 'DRAFT' | 'APPROVED' | 'IN_REVIEW';
  createdAt: string;
}

export const promotionDesignsService = {
  getAll: (search?: string) => api.get<PromotionDesign[]>("/promotion-designs", { params: { search } }).then(r => r.data),
  create: (data: any) => api.post<PromotionDesign>("/promotion-designs", data).then(r => r.data),
  update: (id: number, data: any) => api.put<PromotionDesign>(`/promotion-designs/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/promotion-designs/${id}`).then(r => r.data),
};
