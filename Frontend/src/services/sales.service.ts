import api from './api';

export enum SaleStatus {
  Lead = 'Lead',
  Opportunity = 'Opportunity',
  Sale = 'Sale',
  Invoice = 'Invoice',
}

export interface Sale {
  id: number;
  amount: number;
  status: SaleStatus;
  date: string;
  purchaseCount: number;
  customerId: number;
  productId: number;
  customer: { id: number; name: string };
  product: { id: number; name: string };
  createdAt: string;
}

export interface SalesMetadata {
  customers: { id: number; name: string }[];
  products: { id: number; name: string }[];
}

export interface PipelineStats {
  Lead: number;
  Opportunity: number;
  Sale: number;
  Invoice: number;
}

export interface CreateSaleDto {
  amount: number;
  status?: SaleStatus;
  customerId: number;
  productId: number;
  purchaseCount?: number;
}

export const salesService = {
  getSalesData: async (purchaseCount?: '1' | 'gt1') => {
    const response = await api.get<Sale[]>('/sales', {
      params: { purchaseCount },
    });
    return response.data;
  },

  getSalesMetadata: async () => {
    const response = await api.get<SalesMetadata>('/sales/form-metadata');
    return response.data;
  },

  getPipelineStats: async () => {
    const response = await api.get<PipelineStats>('/sales/pipeline-flow');
    return response.data;
  },

  createSale: async (data: CreateSaleDto) => {
    const response = await api.post<Sale>('/sales', data);
    return response.data;
  },
  
  updateSaleStatus: async (id: number, status: SaleStatus) => {
    const response = await api.patch<Sale>(`/sales/${id}/status`, { status });
    return response.data;
  },
};
