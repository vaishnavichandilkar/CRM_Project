import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { shgService, SHG } from "../../../services/masters.service";
import { toast } from "sonner";

export function SHGPage() {
  const [data, setData] = useState<SHG[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<SHG | null>(null);

  const [formData, setFormData] = useState({
    groupName: "",
    leaderName: "",
    numberOfMembers: "",
    region: "",
    activity: "",
  });

  const fetchData = async (query?: string) => {
    setIsLoading(true);
    try {
      const result = await shgService.getAll(query);
      setData(result);
    } catch (error) {
      toast.error("Failed to fetch SHG data");
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
        numberOfMembers: parseInt(formData.numberOfMembers),
        region: formData.region || undefined,
      };

      if (editingItem) {
        await shgService.update(editingItem.id, payload);
        toast.success("SHG details updated successfully");
      } else {
        await shgService.create(payload);
        toast.success("SHG group created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (item: SHG) => {
    setEditingItem(item);
    setFormData({
      groupName: item.groupName,
      leaderName: item.leaderName,
      numberOfMembers: item.numberOfMembers.toString(),
      region: item.region || "",
      activity: item.activity,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: SHG) => {
    if (window.confirm(`Are you sure you want to delete ${item.groupName}?`)) {
      try {
        await shgService.delete(item.id);
        toast.success("SHG deleted successfully");
        fetchData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({ groupName: "", leaderName: "", numberOfMembers: "", region: "", activity: "" });
    setIsModalOpen(true);
  };

  const columns = [
    { key: "groupName", label: "Group Name", sortable: true },
    { key: "leaderName", label: "Leader", sortable: true },
    { key: "numberOfMembers", label: "Members", sortable: true },
    { key: "region", label: "Region", sortable: true },
    { key: "activity", label: "Activity", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Self Help Groups (SHG)</h1>
          <p className="text-gray-600 mt-1">Manage SHG network and activities</p>
        </div>
        <Button onClick={handleAddClick} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add SHG
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search groups by name, leader or activity..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Groups</CardTitle>
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
        title={editingItem ? "Edit SHG" : "Add SHG"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Group Name"
              required
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
              placeholder="Enter group name"
            />
            <Input
              label="Leader Name"
              required
              value={formData.leaderName}
              onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
              placeholder="Enter leader name"
            />
            <Input
              label="Number of Members"
              type="number"
              required
              value={formData.numberOfMembers}
              onChange={(e) => setFormData({ ...formData, numberOfMembers: e.target.value })}
              placeholder="Enter member count"
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
            <Input
              label="Activity"
              required
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              placeholder="Enter group activity"
              className="col-span-2"
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
