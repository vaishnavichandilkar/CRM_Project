import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { DataTable } from "./ui/DataTable";
import { Button } from "./ui/Button";
import { Modal, ModalFooter } from "./ui/Modal";
import { Input, Select } from "./ui/Input";
import { toast } from "react-hot-toast";

interface MasterPageTemplateProps {
  title: string;
  description: string;
  columns: any[];
  formFields: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
    options?: string[];
  }>;
  service: {
    getAll: (search?: string) => Promise<any[]>;
    create: (data: any) => Promise<any>;
    update: (id: number, data: any) => Promise<any>;
    delete: (id: number) => Promise<any>;
  };
}

export function MasterPageTemplate({
  title,
  description,
  columns,
  formFields,
  service,
}: MasterPageTemplateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchRecords = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const records = await service.getAll(search);
      setData(records);
    } catch (error) {
      toast.error(`Failed to fetch ${title.toLowerCase()}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [service, title]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await service.update(editingId, formData);
        toast.success(`${title.slice(0, -1)} updated successfully`);
      } else {
        await service.create(formData);
        toast.success(`${title.slice(0, -1)} created successfully`);
      }
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      fetchRecords();
    } catch (error) {
      toast.error(`Failed to save ${title.toLowerCase()}`);
      console.error(error);
    }
  };

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    setFormData(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (window.confirm(`Are you sure you want to delete this ${title.slice(0, -1).toLowerCase()}?`)) {
      try {
        await service.delete(row.id);
        toast.success(`${title.slice(0, -1)} deleted successfully`);
        fetchRecords();
      } catch (error) {
        toast.error(`Failed to delete ${title.toLowerCase()}`);
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({});
          setIsModalOpen(true);
        }} variant="primary" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add {title.slice(0, -1)}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All {title}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={data} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder={`Search ${title.toLowerCase()}...`} 
            />
          )}
        </CardContent>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setFormData({});
        }} 
        title={editingId ? `Edit ${title.slice(0, -1)}` : `Add ${title.slice(0, -1)}`} 
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {editingId ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
