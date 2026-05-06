import { MasterPageTemplate } from "../../components/MasterPageTemplate";

const vetDocsData = [
  { id: 1, name: "Dr. Smith", specialty: "Cattle", phone: "+1234567890", region: "North", status: "Active" },
  { id: 2, name: "Dr. Johnson", specialty: "Poultry", phone: "+1234567891", region: "South", status: "Active" },
];

export function VetDocsPage() {
  return (
    <MasterPageTemplate
      title="Vet Docs"
      description="Manage veterinary doctors"
      data={vetDocsData}
      columns={[
        { key: "name", label: "Doctor Name", sortable: true },
        { key: "specialty", label: "Specialty", sortable: true },
        { key: "phone", label: "Phone" },
        { key: "region", label: "Region", sortable: true },
      ]}
      formFields={[
        { name: "name", label: "Doctor Name", type: "text", required: true },
        { name: "specialty", label: "Specialty", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text", required: true },
        { name: "region", label: "Region", type: "select", options: ["North", "South", "East", "West"] },
      ]}
    />
  );
}
