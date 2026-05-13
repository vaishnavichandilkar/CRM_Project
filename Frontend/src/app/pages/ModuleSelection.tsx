import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  Users, 
  BadgeDollarSign, 
  MapPin, 
  BarChart3, 
  CalendarRange, 
  UserCircle, 
  Store, 
  Package, 
  Palette, 
  Users2, 
  Truck, 
  Stethoscope, 
  Settings, 
  Check,
  ChevronRight,
  ClipboardList,
  Building2
} from "lucide-react";
import { Button } from "../components/ui/Button";
import api from "../../services/api";
import { toast } from "sonner";

interface Module {
  key: string;
  name: string;
  description: string;
  icon: any;
  category: string;
}

const ALL_MODULES: Module[] = [
  { key: "dashboard", name: "Dashboard", description: "Real-time overview of your CRM activities", icon: LayoutDashboard, category: "Core" },
  { key: "leads", name: "Leads & Enquiries", description: "Track and manage potential business opportunities", icon: ClipboardList, category: "Sales" },
  { key: "sales", name: "Sales", description: "Manage orders, invoices and revenue tracking", icon: BadgeDollarSign, category: "Sales" },
  { key: "visits", name: "Visits", description: "Schedule and track field representative visits", icon: MapPin, category: "Core" },
  { key: "reports", name: "Reports", description: "Advanced analytics and performance insights", icon: BarChart3, category: "Core" },
  { key: "content-plans", name: "Content Plans", description: "Plan and schedule marketing content", icon: CalendarRange, category: "Marketing" },
  { key: "customers", name: "Customers", description: "Comprehensive database of all your clients", icon: UserCircle, category: "Masters" },
  { key: "dealers", name: "Dealers", description: "Manage your dealer network and relationships", icon: Store, category: "Masters" },
  { key: "products", name: "Products", description: "Inventory and product catalog management", icon: Package, category: "Masters" },
  { key: "promotion-designs", name: "Promotion Designs", description: "Track marketing design projects", icon: Palette, category: "Marketing" },
  { key: "shg", name: "SHG", description: "Self Help Group management and tracking", icon: Users2, category: "Masters" },
  { key: "suppliers", name: "Suppliers", description: "Manage vendor information and procurement", icon: Building2, category: "Masters" },
  { key: "team", name: "Team", description: "Internal team members and hierarchy", icon: Users, category: "Organization" },
  { key: "transporters", name: "Transporters", description: "Logistics and transport partner management", icon: Truck, category: "Masters" },
  { key: "vet-docs", name: "Vet Docs", description: "Veterinary documentation and specialists", icon: Stethoscope, category: "Masters" },
  { key: "users", name: "Users & Roles", description: "System access control and permissions", icon: Settings, category: "Organization" },
];

export function ModuleSelection() {
  const navigate = useNavigate();
  const [selectedModules, setSelectedModules] = useState<string[]>(ALL_MODULES.map(m => m.key));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserName(user.firstName || "User");
    
    // Check if user already has preferences, if so, we might want to pre-select them
    // But for a "setup" feel, selecting all by default is also fine
  }, []);

  const toggleModule = (key: string) => {
    setSelectedModules(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) 
        : [...prev, key]
    );
  };

  const selectAll = () => {
    setSelectedModules(ALL_MODULES.map(m => m.key));
  };

  const deselectAll = () => {
    setSelectedModules([]);
  };

  const handleContinue = async () => {
    if (selectedModules.length === 0) {
      toast.error("Please select at least one module to continue");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/user-module-preferences", { selectedModules });
      
      // Update local user object to reflect that preferences are set
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.hasModulePreferences = true;
      localStorage.setItem("user", JSON.stringify(user));
      
      // Also save to local storage for quick access in sidebar
      localStorage.setItem("crm_selected_modules", JSON.stringify(selectedModules));
      
      toast.success("Workspace personalized successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Default modules
    const defaultModules = ALL_MODULES.map(m => m.key);
    localStorage.setItem("crm_selected_modules", JSON.stringify(defaultModules));
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                Setup
              </span>
              <span className="text-sm text-gray-500 font-medium">Step 1 of 1</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome to CRM Pro, {userName}!
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Choose the modules you want to use in your personalized workspace.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-white">
                {userName.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={selectAll}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Select All
            </button>
            <button 
              onClick={deselectAll}
              className="text-sm font-medium text-gray-500 hover:text-gray-600"
            >
              Deselect All
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-semibold text-blue-600">{selectedModules.length}</span> modules selected
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ALL_MODULES.map((module) => {
            const isSelected = selectedModules.includes(module.key);
            const Icon = module.icon;
            
            return (
              <div 
                key={module.key}
                onClick={() => toggleModule(module.key)}
                className={`
                  relative group cursor-pointer transition-all duration-200 
                  bg-white rounded-2xl p-6 border-2 shadow-sm
                  hover:shadow-md hover:scale-[1.02]
                  ${isSelected ? "border-blue-500 bg-blue-50/30" : "border-transparent hover:border-blue-200"}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                  ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className={`font-bold text-lg mb-1 ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                  {module.name}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {module.description}
                </p>

                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-gray-200 pt-8">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="w-full sm:w-auto px-8"
          >
            Skip for Now
          </Button>
          <Button 
            variant="primary" 
            onClick={handleContinue}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-12 py-6 text-lg group"
          >
            {isSubmitting ? "Setting up workspace..." : "Continue to Dashboard"}
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
