import { useState, useEffect } from "react";
import { 
  Check, ChevronRight, Plus, 
  LayoutDashboard, Users, ShoppingCart, MapPin, BarChart3, 
  Package, UserCircle, Award, Truck, FileText, Briefcase, 
  Megaphone, Image, User, Settings, Database, Edit2, Trash2,
  AlertCircle
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import api from "../../services/api";
import { CustomModuleBuilder } from "../components/custom-modules/CustomModuleBuilder";
import { Modal, ModalFooter } from "../components/ui/Modal";

const ALL_MODULES = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Real-time overview of your CRM activities" },
  { key: "leads", label: "Leads & Enquiries", icon: Users, description: "Track and manage potential business opportunities" },
  { key: "sales", label: "Sales", icon: ShoppingCart, description: "Manage orders, invoices and revenue tracking" },
  { key: "visits", label: "Visits", icon: MapPin, description: "Schedule and track field representative visits" },
  { key: "reports", label: "Reports", icon: BarChart3, description: "Advanced analytics and performance insights" },
  { key: "content-plans", label: "Content Plans", icon: FileText, description: "Plan and schedule marketing content" },
  { key: "customers", label: "Customers", icon: UserCircle, description: "Comprehensive database of all your clients" },
  { key: "dealers", label: "Dealers", icon: Package, description: "Manage your dealer network and relationships" },
  { key: "products", label: "Products", icon: Database, description: "Inventory and product catalog management" },
  { key: "promotion-designs", label: "Promotion Designs", icon: Image, description: "Track marketing design projects" },
  { key: "shg", label: "SHG", icon: UserCircle, description: "Self Help Group management and tracking" },
  { key: "suppliers", label: "Suppliers", icon: Truck, description: "Manage vendor information and procurement" },
  { key: "team", label: "Team", icon: User, description: "Internal team members and hierarchy" },
  { key: "transporters", label: "Transporters", icon: Truck, description: "Logistics and transport partner management" },
  { key: "vet-docs", label: "Vet Docs", icon: FileText, description: "Veterinary document and record tracking" },
  { key: "users", label: "Users & Roles", icon: Settings, description: "Manage system access and permissions" },
];

const ICON_MAP: Record<string, any> = {
  LayoutDashboard, Database, Table: Database, List: Database, Settings
};

export function ModuleSelection() {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [userName, setUserName] = useState("User");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [customModules, setCustomModules] = useState<any[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<any>(null);
  const [moduleToEdit, setModuleToEdit] = useState<any>(null);

  const navigate = useNavigate();

  const fetchCustomModules = async () => {
    try {
      const response = await api.get("/custom-modules");
      setCustomModules(response.data);
    } catch (error) {
      console.error("Failed to fetch custom modules", error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(user.firstName || "User");
    fetchCustomModules();
    
    const savedModules = localStorage.getItem("crm_selected_modules");
    if (savedModules) {
      setSelectedModules(JSON.parse(savedModules));
    } else {
      setSelectedModules(ALL_MODULES.map(m => m.key));
    }
  }, []);

  const toggleModule = (key: string) => {
    setSelectedModules(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/user-module-preferences", { selectedModules });
      localStorage.setItem("crm_selected_modules", JSON.stringify(selectedModules));
      toast.success("Workspace personalized successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return;
    try {
      await api.delete(`/custom-modules/${moduleToDelete.id}`);
      toast.success(`Module "${moduleToDelete.name}" deleted`);
      setIsDeleteModalOpen(false);
      setModuleToDelete(null);
      
      // Also remove from selected if it was there
      const key = `custom-${moduleToDelete.id}`;
      setSelectedModules(prev => prev.filter(k => k !== key));
      
      fetchCustomModules();
    } catch (error) {
      toast.error("Failed to delete module");
    }
  };

  const handleEditModule = (module: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setModuleToEdit(module);
    setIsBuilderOpen(true);
  };

  const handleDeleteClick = (module: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setModuleToDelete(module);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Welcome, {userName}! 👋
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Choose the modules you want to use in your personalized workspace. 
            You can always change these later from the settings.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-1 mb-10 overflow-hidden border border-slate-100">
          <div className="bg-slate-50/50 p-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedModules(ALL_MODULES.map(m => m.key).concat(customModules.map(m => `custom-${m.id}`)))}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Select All
              </button>
              <button 
                onClick={() => setSelectedModules([])}
                className="text-sm font-semibold text-slate-500 hover:text-slate-600 transition-colors"
              >
                Deselect All
              </button>
            </div>
            <div className="text-sm font-medium text-slate-600">
              <span className="text-blue-600 font-bold">{selectedModules.length}</span> modules selected
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto">
            {ALL_MODULES.map((module) => {
              const isSelected = selectedModules.includes(module.key);
              const Icon = module.icon;
              return (
                <div
                  key={module.key}
                  onClick={() => toggleModule(module.key)}
                  className={`relative group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected 
                      ? "border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-100" 
                      : "border-slate-100 hover:border-blue-200 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white p-1 rounded-full shadow-md animate-in zoom-in duration-300">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  <h3 className={`font-bold text-lg mb-1 transition-colors ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                    {module.label}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              );
            })}

            {/* Custom Modules */}
            {customModules.map((module) => {
              const key = `custom-${module.id}`;
              const isSelected = selectedModules.includes(key);
              const Icon = ICON_MAP[module.icon] || Database;
              return (
                <div
                  key={key}
                  onClick={() => toggleModule(key)}
                  className={`relative group cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected 
                      ? "border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-100" 
                      : "border-slate-100 hover:border-blue-200 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleEditModule(module, e)}
                      className="bg-white text-slate-400 hover:text-blue-600 p-1.5 rounded-lg shadow-sm border border-slate-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(module, e)}
                      className="bg-white text-slate-400 hover:text-red-600 p-1.5 rounded-lg shadow-sm border border-slate-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isSelected && (
                      <div className="bg-blue-600 text-white p-1 rounded-full shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg transition-colors ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                      {module.name}
                    </h3>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase tracking-wider">Custom</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              );
            })}

            <button
              onClick={() => { setModuleToEdit(null); setIsBuilderOpen(true); }}
              className="group p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-900 transition-colors">Create Module</h3>
                <p className="text-sm text-slate-500">Add custom structures</p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <Button
            onClick={handleContinue}
            disabled={isSubmitting || selectedModules.length === 0}
            className="px-12 py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-xl shadow-blue-200 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? "Setting up workspace..." : "Continue to Dashboard"}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-slate-400 text-sm">
            Selected modules will be available in your side navigation.
          </p>
        </div>
      </div>

      <CustomModuleBuilder 
        isOpen={isBuilderOpen} 
        onClose={() => { setIsBuilderOpen(false); setModuleToEdit(null); }} 
        onSuccess={(newModule) => {
          fetchCustomModules();
          if (newModule && !moduleToEdit) {
            const key = `custom-${newModule.id}`;
            setSelectedModules(prev => [...prev, key]);
          }
        }}
        editModule={moduleToEdit}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Custom Module"
        size="sm"
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
          <p className="text-gray-500 mt-2">
            Are you sure you want to delete the module <span className="font-bold text-gray-900">"{moduleToDelete?.name}"</span>? 
            This will permanently remove all associated records.
          </p>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteModule}>
            Delete Module
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
