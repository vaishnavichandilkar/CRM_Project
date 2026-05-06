import { MasterPageTemplate } from "../../components/MasterPageTemplate";

const contentPlansData = [
  { id: 1, title: "Q2 Campaign", platform: "Facebook", startDate: "2026-04-01", endDate: "2026-06-30", status: "Active" },
  { id: 2, title: "Product Launch", platform: "Instagram", startDate: "2026-05-01", endDate: "2026-05-31", status: "Planned" },
];

export function ContentPlansPage() {
  return (
    <MasterPageTemplate
      title="Content Plans"
      description="Manage marketing content plans"
      data={contentPlansData}
      columns={[
        { key: "title", label: "Campaign Title", sortable: true },
        { key: "platform", label: "Platform", sortable: true },
        { key: "startDate", label: "Start Date", sortable: true },
        { key: "endDate", label: "End Date", sortable: true },
      ]}
      formFields={[
        { name: "title", label: "Campaign Title", type: "text", required: true },
        { name: "platform", label: "Platform", type: "select", options: ["Facebook", "Instagram", "LinkedIn", "Twitter", "YouTube"] },
        { name: "startDate", label: "Start Date", type: "date", required: true },
        { name: "endDate", label: "End Date", type: "date", required: true },
      ]}
    />
  );
}
