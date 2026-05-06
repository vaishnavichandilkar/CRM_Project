import { MasterPageTemplate } from "../../components/MasterPageTemplate";

const shgData = [
  { id: 1, name: "SHG Group A", leader: "Mary Leader", members: 15, region: "North", activity: "Dairy" },
  { id: 2, name: "SHG Group B", leader: "Anna Leader", members: 20, region: "South", activity: "Poultry" },
];

export function SHGPage() {
  return (
    <MasterPageTemplate
      title="SHG (Self Help Groups)"
      description="Manage self-help groups"
      data={shgData}
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
        { name: "region", label: "Region", type: "select", options: ["North", "South", "East", "West"] },
        { name: "activity", label: "Activity", type: "text", required: true },
      ]}
    />
  );
}
