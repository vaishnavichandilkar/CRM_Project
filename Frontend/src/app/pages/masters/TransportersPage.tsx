import { useState, useEffect } from "react";
import { Plus, Search, Truck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { transportersService, Transporter } from "../../../services/transporters.service";
import { toast } from "sonner";

export function TransportersPage() {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTransporter, setEditingTransporter] = useState<Transporter | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    vehicleType: "",
    region: "",
  });

  const fetchTransporters = async (query?: string) => {
    setIsLoading(true);
    try {
      const data = await transportersService.getAll(query);
      setTransporters(data);
    } catch (error) {
      toast.error("Failed to fetch transporters");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransporters();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransporters(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        vehicleType: formData.vehicleType || undefined,
        region: formData.region || undefined,
      };

      if (editingTransporter) {
        await transportersService.update(editingTransporter.id, payload);
        toast.success("Transporter updated successfully");
      } else {
        await transportersService.create(payload);
        toast.success("Transporter created successfully");
      }
      setIsModalOpen(false);
      fetchTransporters();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Operation failed"));
    }
  };

  const handleEdit = (transporter: Transporter) => {
    setEditingTransporter(transporter);
    setFormData({
      name: transporter.name,
      contactPerson: transporter.contactPerson,
      phone: transporter.phone,
      vehicleType: transporter.vehicleType || "",
      region: transporter.region || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (transporter: Transporter) => {
    if (window.confirm(`Are you sure you want to delete ${transporter.name}?`)) {
      try {
        await transportersService.delete(transporter.id);
        toast.success("Transporter deleted successfully");
        fetchTransporters();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleAddClick = () => {
    setEditingTransporter(null);
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      vehicleType: "",
      region: "",
    });
    setIsModalOpen(true);
  };

  const columns = [
    { key: "name", label: "Transporter Name", sortable: true },
    { key: "contactPerson", label: "Contact Person", sortable: true },
    { key: "phone", label: "Phone" },
    { 
      key: "vehicleType", 
      label: "Vehicle Type", 
      sortable: true,
      render: (val: string) => val ? val.charAt(0) + val.slice(1).toLowerCase() : "N/A"
    },
    { key: "region", label: "Region", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transporters</h1>
          <p className="text-gray-600 mt-1">Manage your transportation partners</p>
        </div>
        <Button onClick={handleAddClick} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Transporter
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search transporters by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transporters</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={transporters}
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
        title={editingTransporter ? "Edit Transporter" : "Add Transporter"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Transporter Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter transporter name"
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
              label="Vehicle Type"
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              options={[
                { value: "TRUCK", label: "Truck" },
                { value: "VAN", label: "Van" },
                { value: "BIKE", label: "Bike" },
                { value: "OTHER", label: "Other" },
              ]}
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
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTransporter ? "Update Transporter" : "Create Transporter"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
