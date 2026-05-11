import { useState, useEffect } from "react";
import { Plus, Search, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { contentPlansService, ContentPlan } from "../../../services/contentPlans.service";
import { toast } from "sonner";
import { format } from "date-fns";

export function ContentPlansPage() {
  const [data, setData] = useState<ContentPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<ContentPlan | null>(null);

  const [formData, setFormData] = useState({
    campaignTitle: "",
    platform: "",
    startDate: "",
    endDate: "",
  });

  const fetchData = async (query?: string) => {
    setIsLoading(true);
    try {
      const result = await contentPlansService.getAll(query);
      setData(result);
    } catch (error) {
      toast.error("Failed to fetch content plans");
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
        platform: formData.platform || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingItem) {
        await contentPlansService.update(editingItem.id, payload);
        toast.success("Content plan updated successfully");
      } else {
        await contentPlansService.create(payload);
        toast.success("Content plan created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (item: ContentPlan) => {
    setEditingItem(item);
    setFormData({
      campaignTitle: item.campaignTitle,
      platform: item.platform || "",
      startDate: format(new Date(item.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(item.endDate), "yyyy-MM-dd"),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: ContentPlan) => {
    if (window.confirm(`Are you sure you want to delete "${item.campaignTitle}"?`)) {
      try {
        await contentPlansService.delete(item.id);
        toast.success("Content plan deleted successfully");
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({ campaignTitle: "", platform: "", startDate: "", endDate: "" });
    setIsModalOpen(true);
  };

  const columns = [
    { key: "campaignTitle", label: "Campaign Title", sortable: true },
    { 
      key: "platform", 
      label: "Platform", 
      sortable: true,
      render: (value: string) => value || "N/A"
    },
    { 
      key: "startDate", 
      label: "Start Date", 
      sortable: true,
      render: (value: string) => format(new Date(value), "MMM dd, yyyy")
    },
    { 
      key: "endDate", 
      label: "End Date", 
      sortable: true,
      render: (value: string) => format(new Date(value), "MMM dd, yyyy")
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Plans</h1>
          <p className="text-gray-600 mt-1">Plan and schedule your marketing campaigns</p>
        </div>
        <Button onClick={handleAddClick} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Content Plan
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by campaign title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
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
        title={editingItem ? "Edit Content Plan" : "Add Content Plan"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Campaign Title"
              required
              value={formData.campaignTitle}
              onChange={(e) => setFormData({ ...formData, campaignTitle: e.target.value })}
              placeholder="Enter campaign title"
            />
            <Select
              label="Platform"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              options={[
                { value: "FACEBOOK", label: "Facebook" },
                { value: "INSTAGRAM", label: "Instagram" },
                { value: "LINKEDIN", label: "LinkedIn" },
                { value: "TWITTER", label: "Twitter" },
                { value: "YOUTUBE", label: "YouTube" },
              ]}
            />
            <Input
              label="Start Date"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
