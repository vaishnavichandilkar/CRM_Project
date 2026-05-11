import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";
import { teamService, TeamMember } from "../../../services/team.service";
import { toast } from "sonner";

export function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    region: "",
  });

  const fetchTeam = async (query?: string) => {
    setIsLoading(true);
    try {
      const data = await teamService.getAll(query);
      setTeam(data);
    } catch (error) {
      toast.error("Failed to fetch team members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeam(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await teamService.update(editingMember.id, formData);
        toast.success("Team member updated successfully");
      } else {
        await teamService.create(formData);
        toast.success("Team member added successfully");
      }
      setIsModalOpen(false);
      fetchTeam();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(", ") : (msg || "Operation failed"));
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      fullName: `${member.firstName} ${member.lastName}`,
      email: member.email,
      role: member.role.name,
      region: member.region,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (member: TeamMember) => {
    if (window.confirm(`Are you sure you want to delete ${member.firstName}?`)) {
      try {
        await teamService.delete(member.id);
        toast.success("Team member deleted successfully");
        fetchTeam();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  const handleAddClick = () => {
    setEditingMember(null);
    setFormData({
      fullName: "",
      email: "",
      role: "",
      region: "",
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (_: any, row: TeamMember) => `${row.firstName} ${row.lastName}`,
      sortable: true,
    },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      render: (role: any) => role.name,
      sortable: true,
    },
    { key: "region", label: "Region", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const variant = status === "ACTIVE" ? "success" : "danger";
        const label = status === "ACTIVE" ? "Active" : "Inactive";
        return (
          <Badge variant={variant} className={status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
            {label}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage your sales team</p>
        </div>
        <Button onClick={handleAddClick} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search team members by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={team}
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
        title={editingMember ? "Edit Team Member" : "Add Team Member"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
            />
            <Select
              label="Role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: "Sales Rep", label: "Sales Rep" },
                { value: "Manager", label: "Manager" },
              ]}
            />
            <Select
              label="Region"
              required
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
              {editingMember ? "Update Member" : "Add Member"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
