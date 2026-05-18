import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { 
  Plus, Search, Filter, Download, Database, Calendar, Check, X, 
  AlertCircle, Trash2, Edit, Eye 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Modal, ModalFooter } from "../components/ui/Modal";
import { Input, Select, TextArea } from "../components/ui/input";
import api from "../../services/api";
import { toast } from "sonner";

interface CustomField {
  id: number;
  name: string;
  dataType: string;
}

interface CustomModule {
  id: number;
  name: string;
  description: string;
  icon: string;
  fields: CustomField[];
  allowView: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
}

export function CustomModuleDataPage() {
  const { id } = useParams();
  const [module, setModule] = useState<CustomModule | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Selected record state
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [viewData, setViewData] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [moduleRes, dataRes] = await Promise.all([
        api.get(`/custom-modules`),
        api.get(`/custom-modules/${id}/data`)
      ]);
      
      const foundModule = moduleRes.data.find((m: any) => m.id === parseInt(id || "0"));
      setModule(foundModule);
      setData(dataRes.data);
    } catch (error) {
      toast.error("Failed to fetch module data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddNew = () => {
    const initialForm: Record<string, any> = {};
    module?.fields.forEach(field => {
      initialForm[field.name] = field.dataType === 'boolean' ? false : '';
    });
    setFormData(initialForm);
    setIsEditing(false);
    setSelectedRecordId(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (record: any) => {
    const editData = { ...record };
    delete editData.id;
    delete editData.createdAt;
    setFormData(editData);
    setSelectedRecordId(record.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleViewClick = (record: any) => {
    setViewData(record);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing && selectedRecordId) {
        await api.patch(`/custom-modules/data/${selectedRecordId}`, { data: formData });
        toast.success("Record updated successfully");
      } else {
        await api.post(`/custom-modules/${id}/data`, { data: formData });
        toast.success("Record added successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(isEditing ? "Failed to update record" : "Failed to add record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (record: any) => {
    setSelectedRecordId(record.id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRecordId) return;
    try {
      await api.delete(`/custom-modules/data/${selectedRecordId}`);
      toast.success("Record deleted successfully");
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Module not found</h2>
        <p className="text-gray-500 mt-2">The module you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  const columns = [
    ...module.fields.map(field => ({
      key: field.name,
      label: field.name,
      sortable: true,
      render: (value: any) => {
        if (field.dataType === 'boolean') {
          return value ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />;
        }
        if (field.dataType === 'date' && value) {
          return new Date(value).toLocaleDateString();
        }
        return value?.toString() || "-";
      }
    })),
    { 
      key: "createdAt", 
      label: "Created At", 
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{module.name}</h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">Custom</span>
          </div>
          <p className="text-gray-600">{module.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleAddNew} variant="primary" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
            <Plus className="w-4 h-4 mr-2" />
            Add New Record
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data.map(item => ({ ...item.data, id: item.id, createdAt: item.createdAt }))}
            onEdit={module.allowEdit ? handleEditClick : undefined}
            onDelete={module.allowDelete ? handleDeleteClick : undefined}
            onView={module.allowView ? handleViewClick : undefined}
            searchPlaceholder={`Search ${module.name}...`}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? `Edit ${module.name} Record` : `Add New ${module.name} Record`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {module.fields.map((field) => (
              <div key={field.id} className={field.dataType === 'string' ? 'col-span-2' : ''}>
                {field.dataType === 'boolean' ? (
                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id={`field-${field.id}`}
                      checked={formData[field.name]}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`field-${field.id}`} className="text-sm font-medium text-gray-700">
                      {field.name}
                    </label>
                  </div>
                ) : field.dataType === 'date' ? (
                  <Input
                    label={field.name}
                    type="date"
                    required
                    value={formData[field.name]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  />
                ) : field.dataType === 'number' ? (
                  <Input
                    label={field.name}
                    type="number"
                    required
                    value={formData[field.name]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  />
                ) : (
                  <Input
                    label={field.name}
                    placeholder={`Enter ${field.name.toLowerCase()}`}
                    required
                    value={formData[field.name]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} className="px-8 bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Saving..." : isEditing ? "Update Record" : "Save Record"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`${module.name} Details`}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {module.fields.map((field) => (
              <div key={field.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{field.name}</span>
                <div className="flex items-center gap-2">
                  {field.dataType === 'boolean' ? (
                    viewData[field.name] ? (
                      <span className="flex items-center text-green-600 text-sm font-medium"><Check className="w-4 h-4 mr-1" /> Yes</span>
                    ) : (
                      <span className="flex items-center text-red-600 text-sm font-medium"><X className="w-4 h-4 mr-1" /> No</span>
                    )
                  ) : (
                    <span className="text-gray-900 font-medium">
                      {field.dataType === 'date' ? new Date(viewData[field.name]).toLocaleDateString() : viewData[field.name] || "-"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Info</span>
            <div className="mt-2 text-sm text-gray-500">
              Created on {new Date(viewData.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsViewModalOpen(false)} className="bg-blue-600 hover:bg-blue-700">Close</Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Record"
        size="sm"
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
          <p className="text-gray-500 mt-2">Are you sure you want to delete this record? This action cannot be undone.</p>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
