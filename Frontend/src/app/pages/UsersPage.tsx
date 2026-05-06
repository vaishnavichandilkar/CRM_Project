import { useState } from "react";
import { Plus, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal, ModalFooter } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Input";

const usersData = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@crm.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2026-04-29 10:30",
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah@crm.com",
    role: "Sales Rep",
    status: "Active",
    lastLogin: "2026-04-29 09:15",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@crm.com",
    role: "Manager",
    status: "Active",
    lastLogin: "2026-04-28 16:45",
  },
  {
    id: 4,
    name: "Tom Brown",
    email: "tom@crm.com",
    role: "Sales Rep",
    status: "Inactive",
    lastLogin: "2026-04-20 14:20",
  },
];

const rolePermissions = {
  Admin: ["Full Access", "User Management", "System Settings", "Reports", "Sales", "Leads"],
  Manager: ["Reports", "Sales", "Leads", "Team Management", "Approvals"],
  "Sales Rep": ["Leads", "Sales", "Visits", "Basic Reports"],
};

export function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (value: string) => {
        const variant = value === "Admin" ? "danger" : value === "Manager" ? "warning" : "info";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const variant = value === "Active" ? "success" : "default";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    { key: "lastLogin", label: "Last Login", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Role Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(rolePermissions).map(([role, permissions]) => (
          <Card key={role}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  role === "Admin" ? "bg-red-100" :
                  role === "Manager" ? "bg-yellow-100" :
                  "bg-blue-100"
                }`}>
                  <Shield className={`w-6 h-6 ${
                    role === "Admin" ? "text-red-600" :
                    role === "Manager" ? "text-yellow-600" :
                    "text-blue-600"
                  }`} />
                </div>
                <div>
                  <div className="font-semibold text-lg">{role}</div>
                  <div className="text-sm text-gray-600">
                    {usersData.filter(u => u.role === role).length} users
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                {permissions.map((perm, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    {perm}
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4"
                onClick={() => setSelectedRole(role)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={usersData}
            searchPlaceholder="Search users..."
          />
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                { value: "Admin", label: "Admin" },
                { value: "Manager", label: "Manager" },
                { value: "Sales Rep", label: "Sales Rep" },
              ]}
            />
            <Input
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create User
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Role Details Modal */}
      {selectedRole && (
        <Modal
          isOpen={!!selectedRole}
          onClose={() => setSelectedRole(null)}
          title={`${selectedRole} Permissions`}
          size="md"
        >
          <div className="space-y-3">
            {rolePermissions[selectedRole as keyof typeof rolePermissions].map((perm, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setSelectedRole(null)}>
              Close
            </Button>
            <Button variant="primary">Save Changes</Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
