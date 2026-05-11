import { MasterPageTemplate } from "../../components/MasterPageTemplate";
import { vetDocsService } from "../../../services/vetDocs.service";

export function VetDocsPage() {
  return (
    <MasterPageTemplate
      title="Vet Docs"
      description="Manage your network of veterinary doctors"
      service={vetDocsService}
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
