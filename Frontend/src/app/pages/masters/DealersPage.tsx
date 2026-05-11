import { MasterPageTemplate } from "../../components/MasterPageTemplate";
import { dealersService } from "../../../services/dealers.service";

export function DealersPage() {
  return (
    <MasterPageTemplate
      title="Dealers"
      description="Manage your dealer network"
      service={dealersService}
      columns={[
        { key: "name", label: "Dealer Name", sortable: true },
        { key: "contactPerson", label: "Contact Person", sortable: true },
        { key: "phone", label: "Phone" },
        { key: "region", label: "Region", sortable: true },
      ]}
      formFields={[
        { name: "name", label: "Dealer Name", type: "text", required: true },
        { name: "contactPerson", label: "Contact Person", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text", required: true },
        { name: "region", label: "Region", type: "select", options: ["North", "South", "East", "West"] },
      ]}
    />
  );
}
