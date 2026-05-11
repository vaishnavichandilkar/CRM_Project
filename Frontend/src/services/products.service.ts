import api from "./api";

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  description?: string;
  category: Category;
  status: 'Active' | 'Out of Stock';
  createdAt: string;
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
  getAll: (searchQuery?: string) => 
    api.get<Product[]>("/products", { params: { search: searchQuery } }).then((r) => r.data),
  
  create: (data: CreateProductDto) => 
    api.post<Product>("/products", data).then((r) => r.data),
  
  update: (id: string, data: UpdateProductDto) => 
    api.put<Product>(`/products/${id}`, data).then((r) => r.data),
  
  delete: (id: string) => 
    api.delete(`/products/${id}`).then((r) => r.data),
    
  getCategories: () => 
    api.get<Category[]>("/categories").then((r) => r.data),
};
