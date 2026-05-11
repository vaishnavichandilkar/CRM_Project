import api from "./api";

export interface PromotionDesign {
  id: number;
  designTitle: string;
  type?: 'Banner' | 'Flyer' | 'SocialPost' | 'EmailTemplate' | 'Poster';
  status: 'Draft' | 'Approved' | 'InReview';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionDesignDto {
  designTitle: string;
  type?: string;
  status?: string;
}

export interface UpdatePromotionDesignDto extends Partial<CreatePromotionDesignDto> {}

export const promotionDesignsService = {
  getAll: async (searchQuery?: string) => {
    const response = await api.get<PromotionDesign[]>("/promotion-designs", {
      params: { search: searchQuery },
    });
    return response.data;
  },

  create: async (data: CreatePromotionDesignDto) => {
    const response = await api.post<PromotionDesign>("/promotion-designs", data);
    return response.data;
  },

  update: async (id: number, data: UpdatePromotionDesignDto) => {
    const response = await api.patch<PromotionDesign>(`/promotion-designs/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/promotion-designs/${id}`);
  },
};
