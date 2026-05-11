import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { vetDocsService, VetDoc } from "../../../services/masters.service";
import { toast } from "sonner";

export function VetDocsPage() {
  const [data, setData] = useState<VetDoc[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<VetDoc | null>(null);

  const [formData, setFormData] = useState({
    doctorName: "",
    specialty: "",
    phone: "",
    region: "",
  });

  const fetchData = async (query?: string) => {
    setIsLoading(true);
    try {
      const result = await vetDocsService.getAll(query);
      setData(result);
    } catch (error) {
      toast.error("Failed to fetch vet docs");
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
        await vetDocsService.update(editingItem.id, payload);
        toast.success("Doctor details updated successfully");
      } else {
        await vetDocsService.create(payload);
        toast.success("Doctor added successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (item: VetDoc) => {
    setEditingItem(item);
    setFormData({
      doctorName: item.doctorName,
      specialty: item.specialty,
      phone: item.phone,
      region: item.region || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: VetDoc) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${item.doctorName}?`)) {
      try {
        await vetDocsService.delete(item.id);
        toast.success("Doctor deleted successfully");
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({ doctorName: "", specialty: "", phone: "", region: "" });
    setIsModalOpen(true);
  };

  const columns = [
    { key: "doctorName", label: "Doctor Name", sortable: true },
    { key: "specialty", label: "Specialty", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "region", label: "Region", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vet Docs</h1>
          <p className="text-gray-600 mt-1">Manage veterinary doctors network</p>
        </div>
        <Button onClick={handleAddClick} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search doctors by name or specialty..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Doctors</CardTitle>
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
        title={editingItem ? "Edit Doctor" : "Add Doctor"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Doctor Name"
              required
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              placeholder="Enter doctor name"
            />
            <Input
              label="Specialty"
              required
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="Enter specialty"
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
