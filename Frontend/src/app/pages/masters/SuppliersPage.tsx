import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { suppliersService, Supplier } from "../../../services/masters.service";
import { toast } from "sonner";

export function SuppliersPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    productType: "",
  });

  const fetchData = async (query?: string) => {
    setIsLoading(true);
    try {
      const result = await suppliersService.getAll(query);
      setData(result);
    } catch (error) {
      toast.error("Failed to fetch suppliers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await suppliersService.update(editingItem.id, formData);
        toast.success("Supplier updated successfully");
      } else {
        await suppliersService.create(formData);
        toast.success("Supplier created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (item: Supplier) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      contactPerson: item.contactPerson,
      phone: item.phone,
      productType: item.productType,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Supplier) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await suppliersService.delete(item.id);
        toast.success("Supplier deleted successfully");
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({ name: "", contactPerson: "", phone: "", productType: "" });
    setIsModalOpen(true);
  };

  const columns = [
    { key: "name", label: "Supplier Name", sortable: true },
    { key: "contactPerson", label: "Contact Person", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "productType", label: "Product Type", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage your supplier database</p>
        </div>
        <Button onClick={handleAddClick} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
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
        title={editingItem ? "Edit Supplier" : "Add Supplier"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Supplier Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter supplier name"
            />
            <Input
              label="Contact Person"
              required
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Enter contact person"
            />
            <Input
              label="Phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone"
            />
            <Input
              label="Product Type"
              required
              value={formData.productType}
              onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              placeholder="Enter product type"
            />
          </div>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">{editingItem ? "Update" : "Create"}</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
