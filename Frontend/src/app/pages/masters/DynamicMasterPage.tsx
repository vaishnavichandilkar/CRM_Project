import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { Plus, Loader2, Settings, Trash2, GripVertical } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Modal, ModalFooter } from "../../components/ui/Modal";
import { Input, Select, TextArea } from "../../components/ui/Input";
import { toast } from "react-hot-toast";
import { dynamicMastersService, MasterConfig, MasterRecord } from "../../../services/masters.service";

export function DynamicMasterPage() {
  const { slug } = useParams<{ slug: string }>();
  const [config, setConfig] = useState<MasterConfig | null>(null);
  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState<Record<string, any> | null>(null);
  
  // For schema management
  const [schemaFields, setSchemaFields] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const [configData, recordsData] = await Promise.all([
        dynamicMastersService.getConfig(slug),
        dynamicMastersService.getRecords(slug, { limit: 1000 }),
      ]);
      setConfig(configData);
      setRecords(recordsData.records);
      setSchemaFields(configData.config);
    } catch (error) {
      toast.error("Failed to fetch data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !config) return;

    try {
      setIsSaving(true);
      if (editingId) {
        await dynamicMastersService.updateRecord(editingId, formData);
        toast.success(`${config.name} updated successfully`);
      } else {
        await dynamicMastersService.createRecord(slug, formData);
        toast.success(`${config.name} created successfully`);
      }
      setModalOpen(false);
      setFormData({});
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save record");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSchema = async () => {
    if (!slug || !config) return;
    try {
      setIsSaving(true);
      await dynamicMastersService.updateConfig(slug, {
        name: config.name,
        config: schemaFields
      });
      toast.success("Master schema updated successfully");
      setSettingsOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to update schema");
    } finally {
      setIsSaving(false);
    }
  };

  const addSchemaField = () => {
    setSchemaFields([
      ...schemaFields,
      { label: "", key: "", dataType: "string", validationRules: { required: false } }
    ]);
  };

  const removeSchemaField = (index: number) => {
    setSchemaFields(schemaFields.filter((_, i) => i !== index));
  };

  const updateSchemaField = (index: number, updates: any) => {
    const newFields = [...schemaFields];
    newFields[index] = { ...newFields[index], ...updates };
    setSchemaFields(newFields);
  };

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    const { id, createdAt, updatedAt, masterConfigId, ...rest } = row;
    setFormData(rest);
    setModalOpen(true);
  };

  const handleView = (row: any) => {
    setViewData(row);
    setViewModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await dynamicMastersService.deleteRecord(row.id);
        toast.success("Record deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete record");
      }
    }
  };

  if (loading && !config) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!config) return <div className="text-center py-12"><h2>Master not found</h2></div>;

  const columns = config.config.map((field) => ({
    key: field.key,
    label: field.label,
    render: (value: any) => {
      if (field.dataType === 'date' && value) return new Date(value).toLocaleDateString();
      if (Array.isArray(value)) return value.join(', ');
      return value;
    }
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
          <p className="text-gray-600 mt-1">Manage {config.name.toLowerCase()} records</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setSettingsOpen(true)} variant="secondary">
            <Settings className="w-4 h-4 mr-2" />
            Manage Columns
          </Button>
          <Button onClick={() => { setEditingId(null); setFormData({}); setModalOpen(true); }} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add {config.name.replace(/s$/, '')}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={records}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            searchPlaceholder={`Search ${config.name.toLowerCase()}...`}
          />
        </CardContent>
      </Card>

      {/* Record Entry Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? `Edit ${config.name}` : `Add New ${config.name}`}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {config.config.map((field) => {
              const commonProps = {
                key: field.key,
                label: field.label,
                required: field.validationRules?.required,
                value: formData[field.key] || "",
                onChange: (e: any) => setFormData({ ...formData, [field.key]: e.target.value }),
                placeholder: `Enter ${field.label.toLowerCase()}`,
              };
              switch (field.dataType) {
                case 'paragraph': return <div className="col-span-2" key={field.key}><TextArea {...commonProps} /></div>;
                case 'dropdown': return <Select {...commonProps} options={field.options?.map((opt: string) => ({ value: opt, label: opt })) || []} />;
                case 'checkbox': return <div key={field.key} className="flex items-center gap-2 py-6"><input type="checkbox" checked={!!formData[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })} /><label>{field.label}</label></div>;
                case 'date': return <Input {...commonProps} type="date" />;
                default: return <Input {...commonProps} type={field.dataType === 'number' ? 'number' : 'text'} />;
              }
            })}
          </div>
          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSaving}>{editingId ? "Update" : "Create"}</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Schema Settings Modal */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={`Manage ${config.name} Columns`}
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Define the data fields for this master. Changes will affect the form and the table.</p>
          <div className="space-y-2">
            {schemaFields.map((field, index) => (
              <div key={index} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 w-full">
                  <GripVertical className="text-gray-400 cursor-move" />
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <Input placeholder="Label (e.g. Price)" value={field.label} onChange={(e) => updateSchemaField(index, { label: e.target.value })} />
                    <Input placeholder="Key (e.g. price)" value={field.key} onChange={(e) => updateSchemaField(index, { key: e.target.value })} />
                    <Select 
                      value={field.dataType} 
                      onChange={(e) => updateSchemaField(index, { dataType: e.target.value })}
                      options={[
                        { value: "string", label: "Short Answer" },
                        { value: "number", label: "Number" },
                        { value: "paragraph", label: "Paragraph" },
                        { value: "dropdown", label: "Drop-down" },
                        { value: "date", label: "Date" },
                      ]}
                    />
                    <div className="flex items-center gap-2 px-2">
                      <input type="checkbox" checked={field.validationRules?.required} onChange={(e) => updateSchemaField(index, { validationRules: { ...field.validationRules, required: e.target.checked } })} />
                      <span className="text-sm">Required</span>
                    </div>
                  </div>
                  <button onClick={() => removeSchemaField(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
                {field.dataType === "dropdown" && (
                  <div className="pl-8 pr-10 flex items-center gap-3 w-full">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-36 shrink-0">Dropdown Options:</span>
                    <Input 
                      placeholder="Enter options separated by commas (e.g. Feed, Medicine, Equipment, Chicks, General)" 
                      value={field.options?.join(",") || ""} 
                      onChange={(e) => updateSchemaField(index, { 
                        options: e.target.value.split(",") 
                      })}
                      onBlur={(e) => updateSchemaField(index, { 
                        options: e.target.value.split(",").map(s => s.trim()).filter(s => s.length > 0) 
                      })}
                      className="flex-1 h-9 text-xs rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button onClick={addSchemaField} variant="secondary" className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" /> Add Field
          </Button>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveSchema} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Record Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => { setViewModalOpen(false); setViewData(null); }}
        title={`${config.name} Details`}
        size="md"
      >
        <div className="space-y-4">
          {viewData && config.config.map((field) => (
            <div key={field.key} className="flex flex-col gap-1 border-b pb-3">
              <span className="text-sm font-semibold text-gray-500 uppercase">{field.label}</span>
              <span className="text-base text-gray-900">
                {field.dataType === 'date' && viewData[field.key]
                  ? new Date(viewData[field.key]).toLocaleDateString()
                  : Array.isArray(viewData[field.key])
                  ? viewData[field.key].join(', ')
                  : (viewData[field.key]?.toString() || '—')}
              </span>
            </div>
          ))}
        </div>
        <ModalFooter>
          <Button variant="primary" onClick={() => { setViewModalOpen(false); setViewData(null); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
