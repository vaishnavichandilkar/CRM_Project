import { MasterPageTemplate } from "../../components/MasterPageTemplate";

const transportersData = [
  { id: 1, name: "Fast Logistics", contact: "Mike Transport", phone: "+1234567890", vehicleType: "Truck", region: "North" },
  { id: 2, name: "Quick Delivery", contact: "Sara Transport", phone: "+1234567891", vehicleType: "Van", region: "South" },
];

export function TransportersPage() {
  return (
    <MasterPageTemplate
      title="Transporters"
      description="Manage your transportation partners"
      data={transportersData}
      columns={[
        { key: "name", label: "Transporter Name", sortable: true },
        { key: "contact", label: "Contact Person", sortable: true },
        { key: "phone", label: "Phone" },
        { key: "vehicleType", label: "Vehicle Type", sortable: true },
        { key: "region", label: "Region", sortable: true },
      ]}
      formFields={[
        { name: "name", label: "Transporter Name", type: "text", required: true },
        { name: "contact", label: "Contact Person", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text", required: true },
        { name: "vehicleType", label: "Vehicle Type", type: "select", options: ["Truck", "Van", "Bike", "Other"] },
        { name: "region", label: "Region", type: "select", options: ["North", "South", "East", "West"] },
      ]}
    />
  );
}
