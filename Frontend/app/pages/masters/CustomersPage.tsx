import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Input";

const customersData = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1234567890", region: "North", type: "Retail" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1234567891", region: "South", type: "Wholesale" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "+1234567892", region: "East", type: "Retail" },
];

export function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    type: "",
    address: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  const columns = [
    { key: "name", label: "Customer Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "region", label: "Region", sortable: true },
    {
      key: "type",
      label: "Type",
      render: (value: string) => <Badge variant="info">{value}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={customersData} searchPlaceholder="Search customers..." />
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer" size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Customer Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter customer name" />
            <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email" />
            <Input label="Phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone" />
            <Select label="Region" required value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} options={[
              { value: "North", label: "North" },
              { value: "South", label: "South" },
              { value: "East", label: "East" },
              { value: "West", label: "West" },
            ]} />
            <Select label="Customer Type" required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} options={[
              { value: "Retail", label: "Retail" },
              { value: "Wholesale", label: "Wholesale" },
            ]} className="col-span-2" />
            <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Enter address" className="col-span-2" />
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Customer</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
