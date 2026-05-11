import { useState, useEffect } from "react";
import { Plus, Search, Palette } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { promotionDesignsService, PromotionDesign } from "../../../services/promotionDesigns.service";
import { toast } from "sonner";
import { format } from "date-fns";

export function PromotionDesignsPage() {
  const [data, setData] = useState<PromotionDesign[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<PromotionDesign | null>(null);

  const [formData, setFormData] = useState({
    designTitle: "",
    type: "",
    status: "DRAFT",
  });

  const fetchData = async (query?: string) => {
    setIsLoading(true);
    try {
      const result = await promotionDesignsService.getAll(query);
      setData(result);
    } catch (error) {
      toast.error("Failed to fetch promotion designs");
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
        type: formData.type || undefined,
      };

      if (editingItem) {
        await promotionDesignsService.update(editingItem.id, payload);
        toast.success("Design updated successfully");
      } else {
        await promotionDesignsService.create(payload);
        toast.success("Design created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (item: PromotionDesign) => {
    setEditingItem(item);
    setFormData({
      designTitle: item.designTitle,
      type: item.type || "",
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: PromotionDesign) => {
    if (window.confirm(`Are you sure you want to delete "${item.designTitle}"?`)) {
      try {
        await promotionDesignsService.delete(item.id);
        toast.success("Design deleted successfully");
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({ designTitle: "", type: "", status: "DRAFT" });
    setIsModalOpen(true);
  };

  const columns = [
    { key: "designTitle", label: "Design Title", sortable: true },
    { 
      key: "type", 
      label: "Type", 
      sortable: true,
      render: (value: string) => value ? value.replace("_", " ") : "N/A"
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: string) => {
        let variant: "success" | "warning" | "info" | "secondary" = "secondary";
        if (value === "APPROVED") variant = "success";
        if (value === "IN_REVIEW") variant = "warning";
        if (value === "DRAFT") variant = "info";
        
        return (
          <Badge variant={variant}>
            {value.replace("_", " ")}
          </Badge>
        );
      }
    },
    { 
      key: "createdAt", 
      label: "Created Date", 
      sortable: true,
      render: (value: string) => format(new Date(value), "MMM dd, yyyy")
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotion Designs</h1>
          <p className="text-gray-600 mt-1">Manage and track your marketing assets</p>
        </div>
        <Button onClick={handleAddClick} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Design
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by design title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Designs</CardTitle>
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
        title={editingItem ? "Edit Design" : "Add New Design"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Design Title"
              required
              value={formData.designTitle}
              onChange={(e) => setFormData({ ...formData, designTitle: e.target.value })}
              placeholder="Enter design title"
            />
            <Select
              label="Design Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: "BANNER", label: "Banner" },
                { value: "FLYER", label: "Flyer" },
                { value: "SOCIAL_POST", label: "Social Post" },
                { value: "EMAIL_TEMPLATE", label: "Email Template" },
                { value: "POSTER", label: "Poster" },
              ]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "DRAFT", label: "Draft" },
                { value: "IN_REVIEW", label: "In Review" },
                { value: "APPROVED", label: "Approved" },
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
