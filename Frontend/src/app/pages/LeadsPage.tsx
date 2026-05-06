import { useState } from "react";
import { Plus, Phone, Mail, Calendar, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal, ModalFooter } from "../components/ui/Modal";
import { Input, Select, TextArea } from "../components/ui/Input";

const leadsData = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    source: "Meta Ads",
    status: "Open",
    assignedTo: "Sarah Wilson",
    createdAt: "2026-04-28",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567891",
    source: "Referral",
    status: "In Progress",
    assignedTo: "Mike Johnson",
    createdAt: "2026-04-27",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+1234567892",
    source: "Walk-in",
    status: "Won",
    assignedTo: "Tom Brown",
    createdAt: "2026-04-26",
  },
  {
    id: 4,
    name: "Alice Williams",
    email: "alice@example.com",
    phone: "+1234567893",
    source: "Existing Customer",
    status: "Open",
    assignedTo: "Sarah Wilson",
    createdAt: "2026-04-25",
  },
];

export function LeadsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    assignedTo: "",
    notes: "",
  });

  const handleEdit = (lead: any) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      assignedTo: lead.assignedTo,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedLead(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      source: "",
      assignedTo: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone" },
    {
      key: "source",
      label: "Source",
      sortable: true,
      render: (value: string) => <Badge variant="info">{value}</Badge>
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const variant =
          value === "Won" ? "success" :
          value === "In Progress" ? "warning" :
          value === "Lost" ? "danger" :
          "default";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    { key: "assignedTo", label: "Assigned To", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads & Enquiries</h1>
          <p className="text-gray-600 mt-1">Manage your sales leads and track their progress</p>
        </div>
        <Button onClick={handleAddNew} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">24</div>
            <div className="text-sm text-gray-600 mt-1">Open Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-600">18</div>
            <div className="text-sm text-gray-600 mt-1">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">42</div>
            <div className="text-sm text-gray-600 mt-1">Won</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">12</div>
            <div className="text-sm text-gray-600 mt-1">Lost</div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={leadsData}
            onEdit={handleEdit}
            searchPlaceholder="Search leads..."
          />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLead ? "Edit Lead" : "Add New Lead"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter lead name"
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
            />
            <Input
              label="Phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
            <Select
              label="Source"
              required
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              options={[
                { value: "Meta Ads", label: "Meta Ads" },
                { value: "Google Ads", label: "Google Ads" },
                { value: "Referral", label: "Referral" },
                { value: "Walk-in", label: "Walk-in" },
                { value: "Existing Customer", label: "Existing Customer" },
                { value: "Outbound", label: "Outbound" },
              ]}
            />
            <Select
              label="Assign To"
              required
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              options={[
                { value: "Sarah Wilson", label: "Sarah Wilson" },
                { value: "Mike Johnson", label: "Mike Johnson" },
                { value: "Tom Brown", label: "Tom Brown" },
                { value: "Jane Smith", label: "Jane Smith" },
              ]}
              className="col-span-2"
            />
            <TextArea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              className="col-span-2"
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {selectedLead ? "Update Lead" : "Create Lead"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
