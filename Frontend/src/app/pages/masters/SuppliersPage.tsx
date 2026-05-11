import { MasterPageTemplate } from "../../components/MasterPageTemplate";
import { suppliersService } from "../../../services/suppliers.service";

export function SuppliersPage() {
  return (
    <MasterPageTemplate
      title="Suppliers"
      description="Manage your product suppliers"
      service={suppliersService}
      columns={[
        { key: "name", label: "Supplier Name", sortable: true },
        { key: "contactPerson", label: "Contact Person", sortable: true },
        { key: "phone", label: "Phone" },
        { key: "productType", label: "Product Type", sortable: true },
      ]}
      formFields={[
        { name: "name", label: "Supplier Name", type: "text", required: true },
        { name: "contactPerson", label: "Contact Person", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text", required: true },
        { name: "productType", label: "Product Type", type: "text", required: true },
      ]}
    />
  );
}
