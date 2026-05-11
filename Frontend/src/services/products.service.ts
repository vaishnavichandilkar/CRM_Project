import api from './api';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  category?: Category;
  price: number;
  stockQuantity: number;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  categoryId: number;
  price: number;
  stockQuantity: number;
  description?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export const productsService = {
  getAll: async (search?: string) => {
    const response = await api.get<Product[]>('/products', {
      params: { search },
    });
    return response.data;
  },

  create: async (data: CreateProductDto) => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: number, data: UpdateProductDto) => {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
};
