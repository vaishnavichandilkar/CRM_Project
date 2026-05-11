import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select, TextArea } from "../../components/ui/Input";
import { productsService, Product, Category } from "../../../services/products.service";
import { toast } from "sonner";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    price: "",
    stockQuantity: "",
    description: "",
  });

  const fetchProducts = async (query?: string) => {
    setIsLoading(true);
    try {
      const data = await productsService.getAll(query);
      setProducts(data);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productsService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        categoryId: parseInt(formData.categoryId),
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        description: formData.description,
      };

      if (editingProduct) {
        await productsService.update(editingProduct.id, payload);
        toast.success("Product updated successfully");
      } else {
        await productsService.create(payload);
        toast.success("Product created successfully");
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message;
      if (Array.isArray(errorMsg)) {
        toast.error(errorMsg.join(", "));
      } else {
        toast.error(errorMsg || "Operation failed");
      }
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: (product.category?.id || product.categoryId || "").toString(),
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      description: product.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await productsService.delete(product.id);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      sku: "",
      categoryId: "",
      price: "",
      stockQuantity: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const columns = [
    { key: "name", label: "Product Name", sortable: true },
    { key: "sku", label: "SKU", sortable: true },
    { 
      key: "category", 
      label: "Category", 
      sortable: true,
      render: (category: Category) => category.name
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value: number) => `$${value}`,
    },
    { key: "stockQuantity", label: "Stock", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (_: any, row: Product) => {
        const status = row.stockQuantity > 0 ? "Active" : "Out of Stock";
        const variant = status === "Active" ? "success" : "danger";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={handleAddClick} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={products}
            isLoading={isLoading}
            searchable={false}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter product name"
            />
            <Input
              label="SKU"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Enter SKU"
            />
            <Select
              label="Category"
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories.map(c => ({ value: c.id.toString(), label: c.name }))}
            />
            <Input
              label="Price"
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="Enter price"
            />
            <Input
              label="Stock Quantity"
              type="number"
              required
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              placeholder="Enter stock quantity"
            />
            <TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description"
              className="col-span-2"
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
