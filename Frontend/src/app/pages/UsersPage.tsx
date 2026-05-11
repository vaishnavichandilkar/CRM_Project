import { useState, useEffect } from "react";
import { Plus, Shield, Check, X, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal, ModalFooter } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Input";
import { toast } from "sonner";
import { authService } from "../../services/auth.service";
import { usersRolesService, User, Role } from "../../services/users-roles.service";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roleId: "",
    password: "",
  });

  const [requests, setRequests] = useState([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role?.name === "Admin";

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        usersRolesService.getUsers(),
        usersRolesService.getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      toast.error("Failed to fetch users and roles");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (!isAdmin) return;
    setIsRequestsLoading(true);
    try {
      const data = await authService.getPendingResetRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setIsRequestsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  const handleApprove = async (id: string, email: string) => {
    try {
      await authService.approveResetRequest(id);
      toast.success(`Password reset request approved for ${email}`);
      fetchRequests();
      fetchData(); // Update user list if needed (e.g. status)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Approval failed");
    }
  };

  const handleReject = async (id: string, email: string) => {
    try {
      await authService.rejectResetRequest(id);
      toast.success(`Password reset request rejected for ${email}`);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Rejection failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersRolesService.createUser({
        ...formData,
        roleId: parseInt(formData.roleId),
      });
      toast.success("User created successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const columns = [
    { 
      key: "name", 
      label: "Name", 
      sortable: true,
      render: (_: any, row: User) => `${row.firstName} ${row.lastName}`
    },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (role: Role) => {
        const variant = role.name === "Admin" ? "danger" : role.name === "Manager" ? "warning" : "info";
        return <Badge variant={variant}>{role.name}</Badge>;
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const variant = value === "ACTIVE" ? "success" : "default";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    { 
      key: "lastLogin", 
      label: "Last Login", 
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleString() : "Never"
    },
  ];

  const rolePermissions = {
    Admin: ["Full Access", "User Management", "System Settings", "Reports", "Sales", "Leads"],
    Manager: ["Reports", "Sales", "Leads", "Team Management", "Approvals"],
    "Sales Rep": ["Leads", "Sales", "Visits", "Basic Reports"],
  };

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
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  role.name === "Admin" ? "bg-red-100" :
                  role.name === "Manager" ? "bg-yellow-100" :
                  "bg-blue-100"
                }`}>
                  <Shield className={`w-6 h-6 ${
                    role.name === "Admin" ? "text-red-600" :
                    role.name === "Manager" ? "text-yellow-600" :
                    "text-blue-600"
                  }`} />
                </div>
                <div>
                  <div className="font-semibold text-lg">{role.name}</div>
                  <div className="text-sm text-gray-600">
                    {users.filter(u => u.role.id === role.id).length} users
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                {(rolePermissions[role.name as keyof typeof rolePermissions] || []).map((perm, index) => (
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
                onClick={() => setSelectedRole(role.name)}
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
            data={users}
            isLoading={isLoading}
            searchPlaceholder="Search users..."
          />
        </CardContent>
      </Card>

      {/* Password Reset Requests */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              Pending Password Reset Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { 
                  key: "user", 
                  label: "User", 
                  render: (user: any) => (
                    <div>
                      <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  )
                },
                { 
                  key: "requestedAt", 
                  label: "Requested Date",
                  render: (value: string) => new Date(value).toLocaleString()
                },
                {
                  key: "actions",
                  label: "Actions",
                  render: (_: any, row: any) => (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleApprove(row.id, row.email)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(row.id, row.email)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )
                }
              ]}
              data={requests}
              isLoading={isRequestsLoading}
              searchPlaceholder="Search requests..."
            />
          </CardContent>
        </Card>
      )}



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
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Enter first name"
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Enter last name"
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
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              options={roles.map(r => ({ value: r.id.toString(), label: r.name }))}
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
