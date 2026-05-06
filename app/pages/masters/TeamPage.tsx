import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";

const teamData = [
  { id: 1, name: "Sarah Wilson", email: "sarah@crm.com", role: "Sales Rep", region: "North", status: "Active" },
  { id: 2, name: "Mike Johnson", email: "mike@crm.com", role: "Sales Rep", region: "South", status: "Active" },
  { id: 3, name: "Tom Brown", email: "tom@crm.com", role: "Sales Rep", region: "East", status: "Inactive" },
];

export function TeamPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "region", label: "Region", sortable: true },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const variant = value === "Active" ? "success" : "default";
        return <Badge variant={variant}>{value}</Badge>;
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
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={teamData} searchPlaceholder="Search team..." />
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Team Member" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" required placeholder="Enter full name" />
            <Input label="Email" type="email" required placeholder="Enter email" />
            <Select label="Role" required options={[
              { value: "Sales Rep", label: "Sales Rep" },
              { value: "Manager", label: "Manager" },
            ]} />
            <Select label="Region" required options={[
              { value: "North", label: "North" },
              { value: "South", label: "South" },
              { value: "East", label: "East" },
              { value: "West", label: "West" },
            ]} />
          </div>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Add Member</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
