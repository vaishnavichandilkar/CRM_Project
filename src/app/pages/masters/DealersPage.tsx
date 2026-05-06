import { MasterPageTemplate } from "../../components/MasterPageTemplate";

const dealersData = [
  { id: 1, name: "ABC Distributors", contact: "John Dealer", phone: "+1234567890", region: "North", status: "Active" },
  { id: 2, name: "XYZ Traders", contact: "Jane Dealer", phone: "+1234567891", region: "South", status: "Active" },
];

export function DealersPage() {
  return (
    <MasterPageTemplate
      title="Dealers"
      description="Manage your dealer network"
      data={dealersData}
      columns={[
        { key: "name", label: "Dealer Name", sortable: true },
        { key: "contact", label: "Contact Person", sortable: true },
        { key: "phone", label: "Phone" },
        { key: "region", label: "Region", sortable: true },
      ]}
      formFields={[
        { name: "name", label: "Dealer Name", type: "text", required: true },
        { name: "contact", label: "Contact Person", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text", required: true },
        { name: "region", label: "Region", type: "select", options: ["North", "South", "East", "West"] },
      ]}
    />
  );
}
