import { useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal, ModalFooter } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Input";

const salesData = [
  {
    id: 1,
    customer: "John Doe",
    product: "Product A",
    amount: 5000,
    status: "Invoice",
    type: "Fresh",
    date: "2026-04-28",
    resaleCount: 0,
  },
  {
    id: 2,
    customer: "Jane Smith",
    product: "Product B",
    amount: 3500,
    status: "Sale",
    type: "Resale",
    date: "2026-04-27",
    resaleCount: 3,
  },
  {
    id: 3,
    customer: "Bob Johnson",
    product: "Product C",
    amount: 7500,
    status: "Opportunity",
    type: "Fresh",
    date: "2026-04-26",
    resaleCount: 0,
  },
];

export function SalesPage() {
  const [activeTab, setActiveTab] = useState<"fresh" | "resale">("fresh");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    product: "",
    amount: "",
    status: "Lead",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  const filteredData = salesData.filter(sale =>
    activeTab === "fresh" ? sale.type === "Fresh" : sale.type === "Resale"
  );

  const columns = [
    { key: "customer", label: "Customer", sortable: true },
    { key: "product", label: "Product", sortable: true },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const variant =
          value === "Invoice" ? "success" :
          value === "Sale" ? "info" :
          value === "Opportunity" ? "warning" :
          "default";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    ...(activeTab === "resale" ? [{
      key: "resaleCount",
      label: "Purchase Count",
      render: (value: number) => <Badge variant="info">{value}x</Badge>,
    }] : []),
    { key: "date", label: "Date", sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Module</h1>
          <p className="text-gray-600 mt-1">Track sales pipeline from lead to invoice</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add New Sale
        </Button>
      </div>

      {/* Sales Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-blue-600">24</span>
              </div>
              <span className="text-sm font-medium">Lead</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-yellow-600">18</span>
              </div>
              <span className="text-sm font-medium">Opportunity</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-purple-600">12</span>
              </div>
              <span className="text-sm font-medium">Sale</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-green-600">8</span>
              </div>
              <span className="text-sm font-medium">Invoice</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("fresh")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "fresh"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Fresh Sales
        </button>
        <button
          onClick={() => setActiveTab("resale")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "resale"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Resale
        </button>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>{activeTab === "fresh" ? "Fresh Sales" : "Resale History"}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredData}
            searchPlaceholder="Search sales..."
          />
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Sale"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Customer"
              required
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              options={[
                { value: "John Doe", label: "John Doe" },
                { value: "Jane Smith", label: "Jane Smith" },
                { value: "Bob Johnson", label: "Bob Johnson" },
              ]}
            />
            <Select
              label="Product"
              required
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              options={[
                { value: "Product A", label: "Product A" },
                { value: "Product B", label: "Product B" },
                { value: "Product C", label: "Product C" },
              ]}
            />
            <Input
              label="Amount"
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter amount"
            />
            <Select
              label="Status"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "Lead", label: "Lead" },
                { value: "Opportunity", label: "Opportunity" },
                { value: "Sale", label: "Sale" },
                { value: "Invoice", label: "Invoice" },
              ]}
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Sale
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
