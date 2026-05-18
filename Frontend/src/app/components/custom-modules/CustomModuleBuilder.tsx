import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { resetBuilder } from '../../store/slices/customModuleSlice';
import { Modal, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/input';
import { Trash2, Plus, LayoutDashboard, Database, Table, List, Settings, X, Eye, Edit } from 'lucide-react';
import api from '../../../services/api';
import { toast } from 'sonner';

const ICONS = [
  { name: 'LayoutDashboard', icon: LayoutDashboard },
  { name: 'Database', icon: Database },
  { name: 'Table', icon: Table },
  { name: 'List', icon: List },
  { name: 'Settings', icon: Settings },
];

const DATA_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
];

interface Field {
  name: string;
  dataType: string;
}

interface CustomModuleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editModule?: any;
}

export function CustomModuleBuilder({ isOpen, onClose, onSuccess, editModule }: CustomModuleBuilderProps) {
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'LayoutDashboard',
    allowView: true,
    allowEdit: true,
    allowDelete: true,
    fields: [] as Field[],
  });

  useEffect(() => {
    if (isOpen) {
      if (editModule) {
        setFormData({
          name: editModule.name,
          description: editModule.description,
          icon: editModule.icon,
          allowView: editModule.allowView ?? true,
          allowEdit: editModule.allowEdit ?? true,
          allowDelete: editModule.allowDelete ?? true,
          fields: editModule.fields.map((f: any) => ({ name: f.name, dataType: f.dataType })),
        });
      } else {
        setFormData({
          name: '',
          description: '',
          icon: 'LayoutDashboard',
          allowView: true,
          allowEdit: true,
          allowDelete: true,
          fields: [{ name: '', dataType: 'string' }],
        });
      }
    }
  }, [isOpen, editModule]);

  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, { name: '', dataType: 'string' }]
    }));
  };

  const handleUpdateField = (index: number, updates: Partial<Field>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, ...updates } : f)
    }));
  };

  const handleRemoveField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Module name is required');
      return;
    }
    if (formData.fields.length === 0) {
      toast.error('At least one field is required');
      return;
    }
    if (formData.fields.some(f => !f.name.trim())) {
      toast.error('All field names must be filled');
      return;
    }

    try {
      if (editModule) {
        const response = await api.patch(`/custom-modules/${editModule.id}`, formData);
        toast.success('Custom module updated successfully!');
        onSuccess(response.data);
      } else {
        const response = await api.post('/custom-modules', formData);
        toast.success('Custom module created successfully!');
        onSuccess(response.data);
      }
      dispatch(resetBuilder());
      onClose();
    } catch (error) {
      toast.error(editModule ? 'Failed to update module' : 'Failed to create module');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editModule ? "Edit Custom Module" : "Create Custom Module"} size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Module Name"
            placeholder="e.g. Inventory" 
            value={formData.name} 
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Icon</label>
            <div className="flex gap-2">
              {ICONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: item.name }))}
                    className={`p-2.5 rounded-xl border-2 transition-all ${formData.icon === item.name ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-gray-100 text-gray-400 hover:border-blue-200 hover:bg-gray-50'}`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <Input 
          label="Description"
          placeholder="What is this module for?" 
          value={formData.description} 
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />

        {/* Action Permissions Section */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Record Actions (Choose allowed actions)</h3>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.allowView ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border border-slate-200'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.allowView}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowView: e.target.checked }))}
                />
                <Eye className="w-5 h-5" />
              </div>
              <span className={`text-sm font-semibold ${formData.allowView ? 'text-blue-900' : 'text-slate-500'}`}>Allow View</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.allowEdit ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-white text-slate-400 border border-slate-200'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.allowEdit}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowEdit: e.target.checked }))}
                />
                <Edit className="w-5 h-5" />
              </div>
              <span className={`text-sm font-semibold ${formData.allowEdit ? 'text-green-900' : 'text-slate-500'}`}>Allow Edit</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${formData.allowDelete ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-white text-slate-400 border border-slate-200'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.allowDelete}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowDelete: e.target.checked }))}
                />
                <Trash2 className="w-5 h-5" />
              </div>
              <span className={`text-sm font-semibold ${formData.allowDelete ? 'text-red-900' : 'text-slate-500'}`}>Allow Delete</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Module Fields</h3>
            <Button variant="ghost" size="sm" onClick={handleAddField} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-1" />
              Add Field
            </Button>
          </div>

          <div className="space-y-3">
            {formData.fields.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-400">No fields added yet. Click "Add Field" to start building.</p>
              </div>
            ) : (
              formData.fields.map((field, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex-1">
                    <input 
                      placeholder="Field Name (e.g. Serial No)" 
                      value={field.name}
                      onChange={(e) => handleUpdateField(index, { name: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none"
                    />
                  </div>
                  <div className="w-32">
                    <Select 
                      options={DATA_TYPES}
                      value={field.dataType}
                      onChange={(e) => handleUpdateField(index, { dataType: e.target.value })}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveField(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Card Preview</h4>
          <div className="max-w-[300px]">
             <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-xl shadow-blue-50">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-blue-600 text-white">
                  {(() => {
                    const iconObj = ICONS.find(i => i.name === formData.icon);
                    const PreviewIcon = iconObj ? iconObj.icon : LayoutDashboard;
                    return <PreviewIcon className="w-6 h-6" />;
                  })()}
                </div>
                <h3 className="font-bold text-lg mb-1 text-blue-900">
                  {formData.name || "My New Module"}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {formData.description || "Describe what data this module will track..."}
                </p>
              </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} className="px-8 bg-blue-600 hover:bg-blue-700 text-white">
            {editModule ? "Save Changes" : "Create Module"}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
