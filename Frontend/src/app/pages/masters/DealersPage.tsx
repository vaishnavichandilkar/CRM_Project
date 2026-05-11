import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { dealersService, Dealer } from "../../../services/masters.service";
import { toast } from "sonner";

export function DealersPage() {
  const [data, setData] = useState<Dealer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<Dealer | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    region: "",
  });

  const fetchData = async (query?: string) => {
    setIsLoading(true);
    try {
      const result = await dealersService.getAll(query);
      setData(result);
    } catch (error) {
      toast.error("Failed to fetch dealers");
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
      const payload = {
        ...formData,
        region: formData.region || undefined,
      };

      if (editingItem) {
        await dealersService.update(editingItem.id, payload);
        toast.success("Dealer updated successfully");
      } else {
        await dealersService.create(payload);
        toast.success("Dealer created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (item: Dealer) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      contactPerson: item.contactPerson,
      phone: item.phone,
      region: item.region || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Dealer) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        await dealersService.delete(item.id);
        toast.success("Dealer deleted successfully");
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({ name: "", contactPerson: "", phone: "", region: "" });
    setIsModalOpen(true);
  };

  const columns = [
    { key: "name", label: "Dealer Name", sortable: true },
    { key: "contactPerson", label: "Contact Person", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "region", label: "Region", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dealers</h1>
          <p className="text-gray-600 mt-1">Manage your dealer network</p>
        </div>
        <Button onClick={handleAddClick} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Dealer
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search dealers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Dealers</CardTitle>
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
        title={editingItem ? "Edit Dealer" : "Add Dealer"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dealer Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter dealer name"
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
            <Select
              label="Region"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              options={[
                { value: "NORTH", label: "North" },
                { value: "SOUTH", label: "South" },
                { value: "EAST", label: "East" },
                { value: "WEST", label: "West" },
              ]}
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
