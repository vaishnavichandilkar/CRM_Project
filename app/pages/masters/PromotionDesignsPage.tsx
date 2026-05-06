import { MasterPageTemplate } from "../../components/MasterPageTemplate";

const promotionDesignsData = [
  { id: 1, title: "Summer Sale Banner", type: "Banner", status: "Approved", createdDate: "2026-04-15" },
  { id: 2, title: "Product Flyer", type: "Flyer", status: "Draft", createdDate: "2026-04-20" },
];

export function PromotionDesignsPage() {
  return (
    <MasterPageTemplate
      title="Promotion Designs"
      description="Manage promotional design assets"
      data={promotionDesignsData}
      columns={[
        { key: "title", label: "Design Title", sortable: true },
        { key: "type", label: "Type", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "createdDate", label: "Created Date", sortable: true },
      ]}
      formFields={[
        { name: "title", label: "Design Title", type: "text", required: true },
        { name: "type", label: "Type", type: "select", options: ["Banner", "Flyer", "Social Post", "Email Template", "Poster"] },
        { name: "status", label: "Status", type: "select", options: ["Draft", "Approved", "In Review"] },
      ]}
    />
  );
}
