import { MasterPageTemplate } from "../../components/MasterPageTemplate";
import { shgService } from "../../../services/shg.service";

export function SHGPage() {
  return (
    <MasterPageTemplate
      title="SHG"
      description="Manage Self Help Groups"
      service={shgService}
      columns={[
        { key: "name", label: "Group Name", sortable: true },
        { key: "leader", label: "Leader", sortable: true },
        { key: "members", label: "Members", sortable: true },
        { key: "region", label: "Region", sortable: true },
        { key: "activity", label: "Activity", sortable: true },
      ]}
      formFields={[
        { name: "name", label: "Group Name", type: "text", required: true },
        { name: "leader", label: "Leader Name", type: "text", required: true },
        { name: "members", label: "Number of Members", type: "number", required: true },
        { name: "activity", label: "Activity", type: "text", required: true },
        { name: "region", label: "Region", type: "select", options: ["North", "South", "East", "West"] },
      ]}
    />
  );
}
