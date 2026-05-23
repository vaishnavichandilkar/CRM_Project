import { useState } from "react";
import { Plus, Calendar as CalendarIcon, MapPin, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal, ModalFooter } from "../components/ui/Modal";
import { Input, Select, TextArea } from "../components/ui/Input";

const visitsData = [
  {
    id: 1,
    customer: "ABC Dealers",
    assignedTo: "Sarah Wilson",
    date: "2026-04-30",
    status: "Scheduled",
    location: "North Region",
    petrolAllowance: 50,
    feedback: "",
  },
  {
    id: 2,
    customer: "XYZ Traders",
    assignedTo: "Mike Johnson",
    date: "2026-04-29",
    status: "Completed",
    location: "South Region",
    petrolAllowance: 75,
    feedback: "Positive meeting, order placed",
  },
  {
    id: 3,
    customer: "Global Dealers",
    assignedTo: "Tom Brown",
    date: "2026-05-01",
    status: "Scheduled",
    location: "East Region",
    petrolAllowance: 60,
    feedback: "",
  },
];

export function VisitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: "",
    assignedTo: "",
    date: "",
    location: "",
    petrolAllowance: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  const columns = [
    { key: "customer", label: "Customer", sortable: true },
    { key: "assignedTo", label: "Assigned To", sortable: true },
    { key: "date", label: "Date", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const variant = value === "Completed" ? "success" : value === "Scheduled" ? "info" : "warning";
        return <Badge variant={variant}>{value}</Badge>;
      },
    },
    { key: "location", label: "Location" },
    {
      key: "petrolAllowance",
      label: "Petrol Allowance",
      render: (value: number) => `$${value}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visits & Field Tracking</h1>
          <p className="text-gray-600 mt-1">Schedule and manage field visits</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary" className="w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Visit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-gray-600">Completed Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-sm text-gray-600">Follow-ups</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">$420</div>
                <div className="text-sm text-gray-600">Total Allowance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View Notice */}
      <Card>
        <CardContent className="py-8 text-center text-gray-600">
          <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Calendar view would be integrated here using a date picker library</p>
        </CardContent>
      </Card>

      {/* Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={visitsData}
            searchPlaceholder="Search visits..."
          />
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Visit"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Customer"
              required
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              options={[
                { value: "ABC Dealers", label: "ABC Dealers" },
                { value: "XYZ Traders", label: "XYZ Traders" },
                { value: "Global Dealers", label: "Global Dealers" },
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
              ]}
            />
            <Input
              label="Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
            <Input
              label="Location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
            />
            <Input
              label="Petrol Allowance ($)"
              type="number"
              required
              value={formData.petrolAllowance}
              onChange={(e) => setFormData({ ...formData, petrolAllowance: e.target.value })}
              placeholder="Enter amount"
            />
            <TextArea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes..."
              className="col-span-1 sm:col-span-2"
            />
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Visit
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
