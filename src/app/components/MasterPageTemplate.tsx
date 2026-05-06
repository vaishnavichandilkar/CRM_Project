import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { DataTable } from "./ui/DataTable";
import { Button } from "./ui/Button";
import { Modal, ModalFooter } from "./ui/Modal";
import { Input, Select } from "./ui/Input";

interface MasterPageTemplateProps {
  title: string;
  description: string;
  data: any[];
  columns: any[];
  formFields: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
    options?: string[];
  }>;
}

export function MasterPageTemplate({ title, description, data, columns, formFields }: MasterPageTemplateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add {title.slice(0, -1)}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} searchPlaceholder={`Search ${title.toLowerCase()}...`} />
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${title.slice(0, -1)}`} size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {formFields.map((field) =>
              field.type === "select" ? (
                <Select
                  key={field.name}
                  label={field.label}
                  required={field.required}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  options={(field.options || []).map((opt) => ({ value: opt, label: opt }))}
                />
              ) : (
                <Input
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  required={field.required}
                  value={formData[field.name] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )
            )}
          </div>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
