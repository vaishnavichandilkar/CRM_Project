import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, Users, ShoppingCart, MapPin, BarChart3,
  Database, Menu, X, Search, Bell, User, LogOut, ChevronDown,
  Package, UserCircle, Award, Truck, FileText, Briefcase, Megaphone, Image,
  AlertCircle, Settings, Table, List
} from "lucide-react";
import { Modal, ModalFooter } from "../ui/Modal";
import { Button } from "../ui/Button";
import { authService } from "../../../services/auth.service";
import { dynamicMastersService, MasterConfig } from "../../../services/masters.service";
import { leadsService } from "../../../services/leads.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import api from "../../../services/api";

// Map slugs to icons for the sidebar
const iconMap: Record<string, any> = {
  'products': Package,
  'customers': UserCircle,
  'team': Users,
  'dealers': Award,
  'suppliers': Briefcase,
  'transporters': Truck,
  'vet-docs': FileText,
  'shg': Users,
  'content-plans': Megaphone,
  'promotion-designs': Image,
};

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mastersOpen, setMastersOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dynamicMasters, setDynamicMasters] = useState<MasterConfig[]>([]);
  const [customModules, setCustomModules] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = authService.getCurrentUser();

  const [selectedModules, setSelectedModules] = useState<string[] | null>(() => {
    const saved = localStorage.getItem("crm_selected_modules");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (selectedModules) {
      const path = location.pathname;
      const pathToKey: Record<string, string> = {
        '/': 'dashboard',
        '/leads': 'leads',
        '/sales': 'sales',
        '/visits': 'visits',
        '/reports': 'reports',
        '/users': 'users',
      };
      
      let key = pathToKey[path];
      if (!key && path.startsWith('/masters/')) {
        key = path.split('/')[2];
      }
      
      if (key && !selectedModules.includes(key)) {
        navigate("/");
      }
    }
  }, [location.pathname, selectedModules, navigate]);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
    } else {
      dynamicMastersService.getAllConfigs()
        .then(setDynamicMasters)
        .catch(console.error);

      // Fetch custom modules
      api.get("/custom-modules")
        .then(res => setCustomModules(res.data))
        .catch(console.error);

      // If not in localStorage, try to fetch from API
      if (!selectedModules) {
        api.get("/user-module-preferences")
          .then(res => {
            if (res.data?.selectedModules) {
              const modules = res.data.selectedModules;
              localStorage.setItem("crm_selected_modules", JSON.stringify(modules));
              setSelectedModules(modules);
            }
          })
          .catch(console.error);
      }

      // Fetch today's follow-up notifications
      leadsService.getTodayNotifications()
        .then(setNotifications)
        .catch(console.error);
    }
  }, [navigate, selectedModules]);

  const isSelected = (key: string) => {
    if (!selectedModules) return true; // Show all while loading
    return selectedModules.includes(key);
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem("crm_selected_modules"); // Clear preferences on logout
    setShowLogoutModal(false);
    navigate("/login");
  };

  const ICON_MAP: Record<string, any> = {
    LayoutDashboard, Database, Table, List, Settings
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="font-bold text-xl text-blue-600">CRM Pro</h1>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {isSelected("dashboard") && <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />}
          {isSelected("leads") && <NavItem to="/leads" icon={Users} label="Leads & Enquiries" />}
          {isSelected("sales") && <NavItem to="/sales" icon={ShoppingCart} label="Sales" />}
          {isSelected("visits") && <NavItem to="/visits" icon={MapPin} label="Visits" />}
          {isSelected("reports") && <NavItem to="/reports" icon={BarChart3} label="Reports" />}

          {/* Masters Dropdown */}
          {dynamicMasters.some(m => isSelected(m.slug)) && (
            <div className="mt-2">
              <button
                onClick={() => setMastersOpen(!mastersOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Database className="w-5 h-5" />
                <span className="flex-1 text-left">Masters</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mastersOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mastersOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {dynamicMasters
                    .filter(m => isSelected(m.slug))
                    .map((m) => (
                      <SubNavItem 
                        key={m.slug} 
                        to={`/masters/${m.slug}`} 
                        icon={iconMap[m.slug] || Database} 
                        label={m.name} 
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {isSelected("users") && <NavItem to="/users" icon={User} label="Users & Roles" />}

          {/* Custom Modules Section */}
          {customModules.some(m => isSelected(`custom-${m.id}`)) && (
            <div className="mt-6 mb-2">
              <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custom Modules</h3>
              <div className="mt-1 space-y-1">
                {customModules
                  .filter(m => isSelected(`custom-${m.id}`))
                  .map(m => (
                    <NavItem 
                      key={m.id} 
                      to={`/custom/${m.id}`} 
                      icon={ICON_MAP[m.icon] || Database} 
                      label={m.name} 
                    />
                  ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => navigate("/module-selection")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Customize Workspace</span>
          </button>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="relative w-96">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads, customers, products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm">Today's Follow-ups</h3>
                    {notifications.length > 0 && (
                      <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {notifications.length} Pending
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs font-semibold">No follow-ups scheduled for today.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {notifications.map((n: any) => (
                          <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-2 border-transparent hover:border-blue-500" onClick={() => { setNotificationsOpen(false); navigate('/leads', { state: { filter: 'TODAY_FOLLOWUPS' } }); }}>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{n.time}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-600 mb-1">{n.customerName}</p>
                            <p className="text-[11px] text-slate-500 truncate">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-gray-100 bg-slate-50/50">
                      <button onClick={() => { setNotificationsOpen(false); navigate('/leads', { state: { filter: 'TODAY_FOLLOWUPS' } }); }} className="w-full text-xs font-bold text-blue-600 hover:text-blue-700 py-1.5">
                        View Leads Dashboard
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-4 border-l border-gray-200 outline-none hover:bg-gray-50 py-1 px-2 rounded-lg transition-colors group">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="font-medium text-sm">{user ? `${user.firstName} ${user.lastName}` : "User"}</div>
                    <div className="text-xs text-gray-500">{user?.role?.name || "Guest"}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user ? `${user.firstName} ${user.lastName}` : "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/module-selection")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Customize Workspace</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600 focus:bg-red-50" 
                  onClick={() => setShowLogoutModal(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        size="sm"
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600">Are you sure you want to logout? You will need to sign in again to access your account.</p>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1 ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );
}

function SubNavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-600 hover:bg-gray-100"
        }`
      }
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </NavLink>
  );
}

function NotificationItem({ title, message, time }: { title: string; message: string; time: string }) {
  return (
    <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
      <div className="font-medium text-sm">{title}</div>
      <div className="text-sm text-gray-600 mt-1">{message}</div>
      <div className="text-xs text-gray-400 mt-1">{time}</div>
    </div>
  );
}
