import { MasterPageTemplate } from "../../components/MasterPageTemplate";

const suppliersData = [
  { id: 1, name: "Supplier A", contact: "John Supply", phone: "+1234567890", product: "Raw Materials", status: "Active" },
  { id: 2, name: "Supplier B", contact: "Jane Supply", phone: "+1234567891", product: "Packaging", status: "Active" },
];

export function SuppliersPage() {
  return (
    <MasterPageTemplate
      title="Suppliers"
      description="Manage your supplier network"
      data={suppliersData}
      columns={[
        { key: "name", label: "Supplier Name", sortable: true },
        { key: "contact", label: "Contact Person", sortable: true },
        { key: "phone", label: "Phone" },
        { key: "product", label: "Product Type", sortable: true },
      ]}
      formFields={[
        { name: "name", label: "Supplier Name", type: "text", required: true },
        { name: "contact", label: "Contact Person", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text", required: true },
        { name: "product", label: "Product Type", type: "text", required: true },
      ]}
    />
  );
}
