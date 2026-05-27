import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Phone, Mail, Calendar, User, Eye, Activity, CheckCircle2, Clock, Trash2, Database, MoreVertical, Edit, Search, Tag, AlertCircle, FileText, Landmark, RefreshCw, Settings, GripVertical, MessageSquare, Upload, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal, ModalFooter } from "../components/ui/Modal";
import { Input, Select, TextArea } from "../components/ui/Input";
import { AppDispatch, RootState } from "../store/store";
import { fetchLeads, fetchEligibleStaff } from "../store/slices/leadSlice";
import { leadsService, LeadSource } from "../services/leadService";
import { dynamicMastersService } from "../../services/masters.service";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useLocation } from "react-router";

interface SearchableCustomerSelectProps {
  label?: string;
  required?: boolean;
  value: string;
  customers: { id: number; name: string }[];
  onChange: (e: { target: { value: string } }) => void;
  placeholder?: string;
}

function SearchableCustomerSelect({
  label,
  required = false,
  value,
  customers,
  onChange,
  placeholder = "Select Customer..."
}: SearchableCustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search when opening/closing
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  const selectedCustomer = customers.find(c => c.id.toString() === value);

  const filteredCustomers = customers.filter(c =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex flex-col gap-1 w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Trigger: Input if open, Button if closed */}
      {isOpen ? (
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            placeholder={selectedCustomer ? selectedCustomer.name : placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-blue-500 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm min-h-[38px] pr-8"
          />
          <span
            onClick={() => setIsOpen(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full px-3 py-2 border border-gray-300 bg-white text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center text-sm cursor-pointer shadow-sm min-h-[38px] hover:border-gray-400 transition-colors"
        >
          <span className={selectedCustomer ? "text-gray-900 font-semibold" : "text-gray-400"}>
            {selectedCustomer ? selectedCustomer.name : placeholder}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {selectedCustomer && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ target: { value: "" } });
                }}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Clear selection"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            )}
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] flex flex-col overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-100">
          
          {/* Customers List - height limited to exactly 10 visible items (approx 36px per item) */}
          <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-50">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((c) => {
                const isSelected = c.id.toString() === value;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: c.id.toString() } });
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-slate-50 transition-colors font-medium ${
                      isSelected ? "bg-blue-50/40 text-blue-600 font-bold" : "text-slate-700"
                    }`}
                  >
                    <span>{c.name}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-xs text-slate-400 font-semibold">
                No matching customers found
              </div>
            )}
          </div>

          {/* Fixed bottom "+ Add New Customer" option */}
          <button
            type="button"
            onClick={() => {
              onChange({ target: { value: "new" } });
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 bg-slate-100 text-left text-sm font-bold text-slate-700 border-t border-slate-200 hover:bg-slate-200/80 hover:text-slate-900 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Add New Customer
          </button>
        </div>
      )}
    </div>
  );
}

interface SearchableProductSelectProps {
  label?: string;
  value: string;
  products: { id: number; name: string }[];
  onChange: (e: { target: { value: string } }) => void;
  placeholder?: string;
}

function SearchableProductSelect({
  label,
  value,
  products,
  onChange,
  placeholder = "Select Product to Add..."
}: SearchableProductSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search when opening/closing
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  const filteredProducts = products.filter(p =>
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex flex-col gap-1 w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {/* Trigger: Input if open, Button if closed */}
      {isOpen ? (
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-blue-500 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm min-h-[38px] pr-8"
          />
          <span
            onClick={() => setIsOpen(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full px-3 py-2 border border-gray-300 bg-white text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center text-sm cursor-pointer shadow-sm min-h-[38px] hover:border-gray-400 transition-colors text-gray-400"
        >
          <span>{placeholder}</span>
          <svg
            className="w-4 h-4 text-gray-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] flex flex-col overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-100">
          
          {/* Products List - height limited to exactly 10 visible items (approx 36px per item) */}
          <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-50">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChange({ target: { value: p.id.toString() } });
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 transition-colors font-medium text-slate-700"
                  >
                    {p.name}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-xs text-slate-400 font-semibold">
                No matching products found
              </div>
            )}
          </div>

          {/* Fixed bottom "+ Add New Product" option */}
          <button
            type="button"
            onClick={() => {
              onChange({ target: { value: "new" } });
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 bg-slate-100 text-left text-sm font-bold text-slate-700 border-t border-slate-200 hover:bg-slate-200/80 hover:text-slate-900 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Add New Product
          </button>
        </div>
      )}
    </div>
  );
}

export function LeadsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { leadsList, eligibleStaff, loading } = useSelector((state: RootState) => state.leads);
  
  // Dashboard & Dropdowns States
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalLeads: 0,
    openLeads: 0,
    inProgressLeads: 0,
    wonLeads: 0,
    lostLeads: 0,
    todayFollowups: 0,
    convertedSales: 0,
    upcomingFollowups: 0,
    missedFollowups: 0,
    completedFollowups: 0,
    totalFollowups: 0,
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [followupFilter, setFollowupFilter] = useState<"today" | "upcoming" | "missed" | "completed">("today");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [followupViewMode, setFollowupViewMode] = useState<"today" | "total">("today");
  const [followupsList, setFollowupsList] = useState<any[]>([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [callStatusFilter, setCallStatusFilter] = useState<string>("ALL");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusRemarkModalOpen, setIsStatusRemarkModalOpen] = useState(false);
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
  
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<any>(null);
  const [statusRemark, setStatusRemark] = useState("");
  
  // Main form states
  const [formData, setFormData] = useState({
    customerId: "" as string | number,
    productId: "" as string | number,
    source: "OTHER" as LeadSource,
    assignedToId: "" as string | number,
    notes: "",
    status: "OPEN",
    callStatus: "Connected",

    // Customer autofilled & editable fields
    customerName: "",
    mobileNumber: "",
    alternateMobile: "",
    email: "",
    gstNumber: "",
    companyName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    customerType: "Retail",
    contactPerson: "",

    // Product autofilled & editable fields
    productName: "",
    productCode: "",
    category: "General",
    brand: "",
    unit: "",
    price: 0,
    tax: 0,
    stockQuantity: 0,
    description: "",

    customerData: {} as Record<string, any>,
    productData: {} as Record<string, any>,
    leadData: {} as Record<string, any>,
    transportationCost: 0,
  });

  // Follow-up logging form states
  const [followupForm, setFollowupForm] = useState({
    callDate: new Date().toISOString().slice(0, 10),
    callTime: new Date().toTimeString().slice(0, 5),
    callType: "Outgoing",
    callStatus: "Connected",
    conversation: "",
    nextFollowupDate: "",
    assignedEmployee: "",
  });

  // Search states for dropdowns
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [customerConfig, setCustomerConfig] = useState<any[]>([]);
  const [productConfig, setProductConfig] = useState<any[]>([]);
  const [leadConfig, setLeadConfig] = useState<any[]>([]);

  // Schedule Call States
  const [scheduleCall, setScheduleCall] = useState(false);
  const [scheduledCallData, setScheduledCallData] = useState({
    callDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // Default to tomorrow
    callTime: "10:00",
    callType: "Outgoing",
  });

  const loadData = async () => {
    try {
      dispatch(fetchLeads());
      dispatch(fetchEligibleStaff());
      const stats = await leadsService.getDashboardStats();
      setDashboardStats(stats);
      const custData = await leadsService.getCustomersDropdown();
      setCustomers(custData);
      const prodData = await leadsService.getProductsDropdown();
      setProducts(prodData);

      const custConf = await dynamicMastersService.getConfig("customers");
      if (custConf) setCustomerConfig(custConf.config);
      
      const prodConf = await dynamicMastersService.getConfig("products");
      if (prodConf) setProductConfig(prodConf.config);
      
      const leadConf = await dynamicMastersService.getConfig("leads");
      if (leadConf) setLeadConfig(leadConf.config);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  useEffect(() => {
    const handleRouteState = async () => {
      if (location.state?.filter) {
        setActiveFilter(location.state.filter);
        window.history.replaceState({}, document.title);
      }
      
      if (location.state?.viewLeadId) {
        const lead = leadsList.find((l: any) => l.id === location.state.viewLeadId);
        if (lead) {
           handleView(lead);
        } else {
           try {
             const leadDetails = await leadsService.getLeadDetails(location.state.viewLeadId);
             handleView(leadDetails);
           } catch(e) {}
        }
        window.history.replaceState({}, document.title);
      }

      if (location.state?.editLeadId) {
        const lead = leadsList.find((l: any) => l.id === location.state.editLeadId);
        if (lead) {
           handleEdit(lead);
        } else {
           try {
             const leadDetails = await leadsService.getLeadDetails(location.state.editLeadId);
             handleEdit(leadDetails);
           } catch(e) {}
        }
        window.history.replaceState({}, document.title);
      }
    };
    
    if (location.state && (leadsList.length > 0 || location.state.filter)) {
      handleRouteState();
    }
  }, [location.state, leadsList]);

  // Recalculate dynamic product prices automatically when customerType changes
  useEffect(() => {
    if (selectedProducts.length > 0) {
      const custType = (formData.type || formData.customerData?.type || formData.customerType || "").toLowerCase();
      setSelectedProducts(prev => prev.map(p => {
        let newPrice = p.price;
        if (custType.includes('dealer') || custType.includes('wholesale')) {
          const dealerRate = p.productData?.dealerRate || p.productData?.['Dealer Rate'];
          if (dealerRate !== undefined) newPrice = parseFloat(dealerRate);
        } else {
          const customerRate = p.productData?.customerRate || p.productData?.['Customer Rate'];
          if (customerRate !== undefined) newPrice = parseFloat(customerRate);
        }
        
        const qty = p.qty || 1;
        const discountAmt = p.discountAmount || 0;
        
        return {
          ...p,
          price: newPrice,
          afterDiscountPrice: (newPrice * qty) - discountAmt
        };
      }));
    }
  }, [formData.customerType, formData.type, formData.customerData?.type]);

  const loadLeadFollowups = async (leadId: number) => {
    try {
      const logs = await leadsService.getFollowups(leadId);
      setFollowupsList(logs);
    } catch (err) {
      console.error("Error loading followups list", err);
    }
  };

  // Column Management States for Lead
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [schemaFields, setSchemaFields] = useState<any[]>([]);
  const [isSavingSchema, setIsSavingSchema] = useState(false);

  const openSchemaSettings = () => {
    setSchemaFields(leadConfig || []);
    setIsSettingsOpen(true);
  };

  const handleSaveSchema = async () => {
    try {
      setIsSavingSchema(true);
      await dynamicMastersService.updateConfig("leads", {
        name: "Leads",
        config: schemaFields
      });
      setIsSettingsOpen(false);
      loadData();
    } catch (error) {
      console.error("Failed to update lead columns", error);
    } finally {
      setIsSavingSchema(false);
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

  const handleAddNew = () => {
    setSelectedLead(null);
    setIsNewCustomer(false);
    setFormData({
      customerId: "",
      productId: "",
      source: "OTHER",
      assignedToId: "",
      notes: "",
      status: "OPEN",
      callStatus: "Connected",
      customerName: "",
      mobileNumber: "",
      alternateMobile: "",
      email: "",
      gstNumber: "",
      companyName: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      customerType: "Retail",
      contactPerson: "",
      productName: "",
      productCode: "",
      category: "General",
      brand: "",
      unit: "",
      price: 0,
      tax: 0,
      stockQuantity: 0,
      customerData: {},
      productData: {},
      leadData: {},
      transportationCost: 0,
    });
    setScheduleCall(false);
    setScheduledCallData({
      callDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      callTime: "10:00",
      callType: "Outgoing",
    });
    setSelectedProducts([]);
    setIsModalOpen(true);
  };

  const handleEdit = (lead: any) => {
    setSelectedLead(lead);
    setIsNewCustomer(!lead.customerId && !!lead.customerName);
    setFormData({
      customerId: lead.customerId || "",
      productId: lead.productId || "",
      source: lead.source || "OTHER",
      assignedToId: lead.assignedToId || "",
      notes: lead.notes || "",
      status: lead.status || "OPEN",
      callStatus: lead.callStatus || "Connected",
      customerName: lead.customerName || "",
      mobileNumber: lead.mobileNumber || "",
      alternateMobile: lead.alternateMobile || "",
      email: lead.email || "",
      gstNumber: lead.gstNumber || "",
      companyName: lead.companyName || "",
      address: lead.address || "",
      city: lead.city || "",
      state: lead.state || "",
      country: lead.country || "",
      pincode: lead.pincode || "",
      customerType: lead.customerType || "Retail",
      contactPerson: lead.contactPerson || "",
      productName: lead.productName || "",
      productCode: lead.productCode || "",
      category: lead.category || "General",
      brand: lead.brand || "",
      unit: lead.unit || "",
      price: lead.price || 0,
      tax: lead.tax || 0,
      stockQuantity: lead.stockQuantity || 0,
      description: lead.description || "",
      customerData: lead.customerData || {},
      productData: lead.productData || {},
      leadData: lead.leadData || {},
      transportationCost: lead.transportationCost || lead.productData?.transportationCost || 0,
    });
    setScheduleCall(false);
    setScheduledCallData({
      callDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      callTime: "10:00",
      callType: "Outgoing",
    });
    
    const prods = lead.productData?.selectedProducts;
    if (prods && Array.isArray(prods)) {
      setSelectedProducts(prods.map(p => ({
        ...p,
        qty: p.qty ?? 1,
        price: p.price ?? 0,
        discountPercent: p.discountPercent ?? 0,
        discountAmount: p.discountAmount ?? 0,
        afterDiscountPrice: p.afterDiscountPrice ?? (p.price * (p.qty ?? 1))
      })));
    } else if (lead.productId || lead.productName) {
      setSelectedProducts([{
        id: lead.productId,
        name: lead.productName,
        sku: lead.productCode,
        category: lead.category || "General",
        price: lead.price || 0,
        qty: 1,
        discountPercent: 0,
        discountAmount: 0,
        afterDiscountPrice: lead.price || 0
      }]);
    } else {
      setSelectedProducts([]);
    }

    setIsModalOpen(true);
  };

  const handleView = async (lead: any) => {
    // Fetch latest timeline & followup logs
    try {
      const fullDetails = await leadsService.getLeadDetails(lead.id);
      setSelectedLead(fullDetails);
      loadLeadFollowups(lead.id);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error("Error viewing lead details", err);
    }
  };

  const handleOpenLogCallModal = async (lead: any) => {
    try {
      const fullDetails = await leadsService.getLeadDetails(lead.id);
      setSelectedLead(fullDetails);
      await loadLeadFollowups(lead.id);
      setFollowupForm({
        callDate: new Date().toISOString().slice(0, 10),
        callTime: new Date().toTimeString().slice(0, 5),
        callType: "Outgoing",
        callStatus: "Connected",
        conversation: "",
        nextFollowupDate: "",
        assignedEmployee: "",
      });
      setIsLogCallModalOpen(true);
    } catch (err) {
      console.error("Error loading lead for reschedule/log", err);
    }
  };

  const handleCustomerSelect = async (id: number) => {
    try {
      const details = await leadsService.getCustomerDetails(id);
      const newCustType = (details.type || "Retail").toLowerCase();
      
      setSelectedProducts(prevProducts => prevProducts.map(p => {
        let newPrice = p.price;
        const pDetails = p.productData || {};
        if (newCustType.includes('dealer') || newCustType.includes('wholesale')) {
          const dealerRate = pDetails.productData?.dealerRate || pDetails.productData?.['Dealer Rate'] || pDetails.dealerRate;
          if (dealerRate) newPrice = parseFloat(dealerRate);
        } else {
          const customerRate = pDetails.productData?.customerRate || pDetails.productData?.['Customer Rate'] || pDetails.customerRate;
          if (customerRate) newPrice = parseFloat(customerRate);
        }
        
        const qty = p.qty || 1;
        const discountAmount = p.discountAmount || 0;
        return {
          ...p,
          price: newPrice,
          afterDiscountPrice: (newPrice * qty) - discountAmount
        };
      }));

      setFormData(prev => ({
        ...prev,
        customerId: id,
        customerName: details.name || "",
        mobileNumber: details.phone || details.mobileNumber || "",
        alternateMobile: details.alternatePhone || details.alternateMobile || "",
        email: details.email || "",
        gstNumber: details.gstNumber || "",
        companyName: details.companyName || "",
        address: details.address || "",
        city: details.city || "",
        state: details.state || "",
        country: details.country || "",
        pincode: details.pincode || "",
        customerType: details.type || "Retail",
        contactPerson: details.contactPerson || "",
        customerData: details || {},
      }));
    } catch (err) {
      console.error("Error auto-fetching customer data", err);
    }
  };

  const handleProductSelect = async (id: number) => {
    try {
      const details = await leadsService.getProductDetails(id);
      let defaultPrice = details.price ? parseFloat(details.price) : 0;
      
      const custType = (formData.type || formData.customerData?.type || formData.customerType || "").toLowerCase();
      if (custType.includes('dealer') || custType.includes('wholesale')) {
        const dealerRate = details.productData?.dealerRate || details.productData?.['Dealer Rate'] || details.dealerRate;
        if (dealerRate) defaultPrice = parseFloat(dealerRate);
      } else {
        const customerRate = details.productData?.customerRate || details.productData?.['Customer Rate'] || details.customerRate;
        if (customerRate) defaultPrice = parseFloat(customerRate);
      }

      setFormData(prev => ({
        ...prev,
        productId: id,
        productName: details.name || "",
        productCode: details.sku || details.productCode || "",
        category: details.category || "General",
        brand: details.brand || "",
        unit: details.quantity || details.productData?.quantity || "",
        price: defaultPrice,
        tax: details.tax ? parseFloat(details.tax) : 0,
        stockQuantity: details.stockQuantity ? parseInt(details.stockQuantity) : 0,
        description: details.description || "",
        productData: details,
      }));
    } catch (err) {
      console.error("Error auto-fetching product data", err);
    }
  };

  const handleAddProduct = async (id: number) => {
    try {
      if (selectedProducts.some(p => p.id === id)) {
        return;
      }
      const details = await leadsService.getProductDetails(id);
      let defaultPrice = details.price ? parseFloat(details.price) : 0;
      
      // Dynamic Pricing based on Customer Type
      const custType = (formData.type || formData.customerData?.type || formData.customerType || "").toLowerCase();
      if (custType.includes('dealer') || custType.includes('wholesale')) {
        const dealerRate = details.productData?.dealerRate || details.productData?.['Dealer Rate'] || details.dealerRate;
        if (dealerRate) defaultPrice = parseFloat(dealerRate);
      } else {
        const customerRate = details.productData?.customerRate || details.productData?.['Customer Rate'] || details.customerRate;
        if (customerRate) defaultPrice = parseFloat(customerRate);
      }

      const defaultQty = details.stockQuantity ? parseInt(details.stockQuantity) : 1;
      setSelectedProducts(prev => [
        ...prev,
        {
          id: id,
          name: details.name || "",
          sku: details.sku || details.productCode || "",
          category: details.category || "General",
          brand: details.brand || "",
          unit: details.quantity || details.productData?.quantity || "",
          price: defaultPrice,
          tax: details.tax ? parseFloat(details.tax) : 0,
          stockQuantity: details.stockQuantity ? parseInt(details.stockQuantity) : 0,
          description: details.description || "",
          productData: details,
          qty: defaultQty,
          discountPercent: 0,
          discountAmount: 0,
          afterDiscountPrice: defaultPrice * defaultQty
        }
      ]);
    } catch (err) {
      console.error("Error adding product to lead", err);
    }
  };

  // Recalculate dynamic product prices automatically when customerType changes
  useEffect(() => {
    if (selectedProducts.length > 0) {
      const custType = (formData.type || formData.customerData?.type || formData.customerType || "").toLowerCase();
      setSelectedProducts(prev => prev.map(p => {
        let newPrice = p.price;
        if (custType.includes('dealer') || custType.includes('wholesale')) {
          const dealerRate = p.productData?.dealerRate || p.productData?.['Dealer Rate'];
          if (dealerRate !== undefined) newPrice = parseFloat(dealerRate);
        } else {
          const customerRate = p.productData?.customerRate || p.productData?.['Customer Rate'];
          if (customerRate !== undefined) newPrice = parseFloat(customerRate);
        }
        
        const qty = p.qty || 1;
        const discountAmt = p.discountAmount || 0;
        
        return {
          ...p,
          price: newPrice,
          afterDiscountPrice: (newPrice * qty) - discountAmt
        };
      }));
    }
  }, [formData.customerType]);

  const updateProductRow = (productId: number, field: string, value: any) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;

      const updatedProduct = {
        ...p,
        [field]: value
      };

      let qty = updatedProduct.qty ?? 1;
      let price = updatedProduct.price ?? 0;
      let discountPercent = updatedProduct.discountPercent ?? 0;
      let discountAmount = updatedProduct.discountAmount ?? 0;

      if (field === 'qty') {
        qty = parseFloat(value) || 0;
        discountAmount = (discountPercent / 100) * (price * qty);
      } else if (field === 'price') {
        price = parseFloat(value) || 0;
        discountAmount = (discountPercent / 100) * (price * qty);
      } else if (field === 'discountPercent') {
        discountPercent = parseFloat(value) || 0;
        discountAmount = (discountPercent / 100) * (price * qty);
      } else if (field === 'discountAmount') {
        discountAmount = parseFloat(value) || 0;
        const totalBefore = price * qty;
        if (totalBefore > 0) {
          discountPercent = (discountAmount / totalBefore) * 100;
        } else {
          discountPercent = 0;
        }
      }

      const afterDiscountPrice = (price * qty) - discountAmount;

      return {
        ...updatedProduct,
        qty,
        price,
        discountPercent: parseFloat(discountPercent.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        afterDiscountPrice: parseFloat(afterDiscountPrice.toFixed(2))
      };
    }));
  };

  const handleRemoveProduct = (id: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...formData,
        customerId: formData.customerId ? Number(formData.customerId) : undefined,
        productId: selectedProducts.length > 0 ? Number(selectedProducts[0].id) : undefined,
        productName: selectedProducts.length > 0 ? selectedProducts.map(p => p.name).join(", ") : "",
        productCode: selectedProducts.length > 0 ? selectedProducts[0].sku : "",
        price: selectedProducts.length > 0 ? selectedProducts.reduce((sum, p) => sum + (p.afterDiscountPrice || p.price || 0), 0) : 0,
        tax: selectedProducts.length > 0 ? parseFloat(selectedProducts[0].tax as any || 0) : 0,
        stockQuantity: selectedProducts.length > 0 ? parseInt(selectedProducts[0].qty as any || 0) : 0,
        category: selectedProducts.length > 0 ? selectedProducts[0].category : "General",
        description: selectedProducts.length > 0 ? selectedProducts[0].description : "",
        assignedToId: formData.assignedToId ? Number(formData.assignedToId) : undefined,
        transportationCost: parseFloat(formData.transportationCost as any || 0),
        productData: {
          ...(formData.productData || {}),
          selectedProducts: selectedProducts,
          transportationCost: parseFloat(formData.transportationCost as any || 0)
        }
      };

      if (!payload.email || payload.email.trim() === "") {
        payload.email = undefined;
      }

      let createdLead: any;
      if (selectedLead) {
        createdLead = await leadsService.updateLead(selectedLead.id, payload);
      } else {
        createdLead = await leadsService.createLead(payload);
      }

      if (scheduleCall && createdLead?.id) {
        const employee = eligibleStaff.find(s => s.id === Number(formData.assignedToId));
        const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : "";
        
        await leadsService.createFollowup(createdLead.id, {
          callDate: scheduledCallData.callDate,
          callTime: scheduledCallData.callTime,
          callType: scheduledCallData.callType,
          conversation: "Scheduled Call / Follow-up",
          nextFollowupDate: scheduledCallData.callDate,
          assignedEmployee: employeeName,
        });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Error saving lead", err);
    }
  };

  const handleStatusChangeClick = (status: string) => {
    setPendingStatusUpdate(status);
    setStatusRemark("");
    setIsStatusRemarkModalOpen(true);
  };

  const submitStatusUpdate = async () => {
    if (!selectedLead || !pendingStatusUpdate) return;
    try {
      await leadsService.updateLeadStatusWithRemarks(selectedLead.id, pendingStatusUpdate, statusRemark);
      setIsStatusRemarkModalOpen(false);
      const updatedDetails = await leadsService.getLeadDetails(selectedLead.id);
      setSelectedLead(updatedDetails);
      loadLeadFollowups(selectedLead.id);
      loadData();
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const handleLogFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await leadsService.createFollowup(selectedLead.id, {
        ...followupForm,
        assignedEmployee: followupForm.assignedEmployee || `${selectedLead.assignedTo?.firstName || ''} ${selectedLead.assignedTo?.lastName || ''}`,
      });
      // Reset log form
      setFollowupForm(prev => ({
        ...prev,
        conversation: "",
        nextFollowupDate: "",
      }));
      // Reload activity feed
      const updatedDetails = await leadsService.getLeadDetails(selectedLead.id);
      setSelectedLead(updatedDetails);
      loadLeadFollowups(selectedLead.id);
      loadData();
      setIsLogCallModalOpen(false);
    } catch (err) {
      console.error("Error logging followup", err);
    }
  };

  // Filtered dropdown lists based on searchable queries
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.customerCode.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.phone.includes(customerSearch)
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const columns = [
    { 
      key: "leadNumber", 
      label: "LEAD ID", 
      sortable: true,
      render: (value: string, row: any) => (
        <span className="font-mono font-bold text-slate-500 bg-slate-100/80 px-2 py-1 rounded text-xs border border-slate-200/50">
          {value || `LD-${String(row.id).padStart(4, '0')}`}
        </span>
      )
    },
    { 
      key: "customerName", 
      label: "Customer Name", 
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{value || "Unnamed Customer"}</span>
          {row.companyName && <span className="text-[10px] text-slate-400 font-medium">{row.companyName}</span>}
        </div>
      )
    },
    { 
      key: "mobileNumber", 
      label: "Contact", 
      render: (value: string, row: any) => (
        <div className="flex flex-col text-xs text-slate-600 gap-0.5">
          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {value || "N/A"}</span>
          {row.email && <span className="flex items-center gap-1 text-[11px] text-slate-400"><Mail className="w-3 h-3 text-slate-300" /> {row.email}</span>}
        </div>
      )
    },
    {
      key: "productName",
      label: "Product",
      sortable: true,
      render: (value: string, row: any) => {
        const selectedProds = row.productData?.selectedProducts;
        if (selectedProds && Array.isArray(selectedProds) && selectedProds.length > 0) {
          return (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-indigo-900">
                {selectedProds[0].name}
                {selectedProds.length > 1 && (
                  <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                    +{selectedProds.length - 1} more
                  </span>
                )}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedProds.map((p: any) => p.sku || "N/A").join(", ")}
              </span>
            </div>
          );
        }
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-indigo-900">{value || "No Product"}</span>
            {row.productCode && <span className="text-[10px] text-slate-400 font-mono">{row.productCode}</span>}
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: string) => {
        const variant =
          value === "WON" || value === "Won" ? "success" :
          value === "IN_PROGRESS" || value === "In Progress" ? "warning" :
          value === "LOST" || value === "Lost" ? "danger" :
          "info";
        
        const displayLabel = 
          value === "WON" ? "WON/CLOSED" : 
          value === "IN_PROGRESS" ? "IN PROGRESS" : 
          value;

        return <Badge variant={variant} className="rounded-lg font-bold text-[10px] tracking-tight uppercase px-2.5 py-1">{displayLabel}</Badge>;
      },
    },
    {
      key: "callStatus",
      label: "Call Status",
      sortable: true,
      render: (value: string) => {
        if (!value) return <span className="text-slate-400 text-xs font-semibold">N/A</span>;
        const colorClass = 
          value === "Connected" ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" :
          value === "Not Connected" ? "bg-rose-50 text-rose-700 border-rose-100/50" :
          value === "Out of Service" ? "bg-amber-50 text-amber-700 border-amber-100/50" :
          value === "Busy" ? "bg-blue-50 text-blue-700 border-blue-100/50" :
          "bg-slate-50 text-slate-700 border-slate-200";

        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] tracking-tight font-bold uppercase border ${colorClass}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: "distance",
      label: "Distance",
      render: (value: any, row: any) => {
        const dist = row.customerData?.distance || row.leadData?.distance || row.distance || "";
        return <span className="font-semibold text-slate-700">{dist ? `${dist} km` : "N/A"}</span>;
      }
    },
    { 
      key: "assignedTo", 
      label: "Assigned Representative", 
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200/50 flex items-center justify-center text-xs font-bold text-blue-700">
            {value ? value.firstName[0] : "?"}
          </div>
          <span className="text-sm text-slate-700 font-medium">{value ? `${value.firstName} ${value.lastName}` : "Unassigned"}</span>
        </div>
      )
    },
  ];

  const filteredLeadsList = leadsList.filter((lead: any) => {
    let tabMatched = false;
    if (activeFilter === "ALL") {
      tabMatched = true;
    } else if (activeFilter === "ACTIVE_PIPELINE") {
      tabMatched = lead.status === "IN_PROGRESS" || lead.status === "In Progress";
    } else if (activeFilter === "WON_CLOSED") {
      tabMatched = lead.status === "WON" || lead.status === "LOST" || lead.status === "Won" || lead.status === "Lost";
    } else if (activeFilter === "TODAY_FOLLOWUPS") {
      if (lead.followups && Array.isArray(lead.followups)) {
        if (followupViewMode === "today") {
          const today = new Date();
          const isTodayLocal = (dateVal: any) => {
            if (!dateVal) return false;
            const d = new Date(dateVal);
            return d.getDate() === today.getDate() &&
                   d.getMonth() === today.getMonth() &&
                   d.getFullYear() === today.getFullYear();
          };
          tabMatched = lead.followups.some((f: any) => {
            return isTodayLocal(f.callDate) || isTodayLocal(f.nextFollowupDate);
          });
        } else {
          tabMatched = lead.followups.length > 0;
        }
      }
    } else if (activeFilter === "CONVERTED") {
      tabMatched = lead.isConverted === true;
    }

    if (!tabMatched) return false;

    if (callStatusFilter !== "ALL") {
      const mainMatch = lead.callStatus === callStatusFilter;
      const followupsMatch = lead.followups && Array.isArray(lead.followups) && lead.followups.some((f: any) => f.callStatus === callStatusFilter);
      return mainMatch || followupsMatch;
    }

    return true;
  });

  const parseCSV = (text: string) => {
    const lines = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          row[row.length - 1] += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push('');
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip LF
        }
        lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      lines.push(row);
    }
    return lines;
  };

  const handleDownloadSampleCSV = () => {
    const headers = [
      "Sr.no",
      "No. of Cattle",
      "Monthly Using",
      "Need QTY",
      "Customers Name",
      "Phone Number",
      "Village",
      "Taluka",
      "Dist",
      "Customer Type",
      "Distance",
      "Order QTY",
      "Rate",
      "Calling Status",
      "Lead Status",
      "Follow-up Date"
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers]);
    
    // Pre-format Column F (phone number, index 5) as text for the first 100 rows so typed entries remain text
    const range = { s: { r: 0, c: 0 }, e: { r: 100, c: 15 } };
    ws['!ref'] = XLSX.utils.encode_range(range);
    for (let r = 1; r <= 100; r++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c: 5 });
      ws[cellAddress] = ws[cellAddress] || { t: 's', v: '' };
      ws[cellAddress].z = '@';
    }

    // Auto-fit column widths to ensure column names and data are clearly visible
    ws['!cols'] = headers.map(header => ({
      wch: Math.max(header.length + 5, 14)
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads Template");
    XLSX.writeFile(wb, "leads_import_sample.xlsx");
    toast.success("Excel sample template downloaded successfully!");
  };

  const handleExportCSV = () => {
    const headers = [
      "Lead Number",
      "Status",
      "Source",
      "Notes",
      "Customer Name",
      "Email",
      "Mobile Number",
      "Alternate Mobile",
      "Company Name",
      "GST Number",
      "Address",
      "Distance",
      "City",
      "State",
      "Country",
      "Pincode",
      "Customer Type",
      "Contact Person",
      "Product Name",
      "Product Code",
      "Category",
      "Brand",
      "Unit",
      "Price",
      "Tax",
      "Stock Quantity",
      "Description",
      "Assigned To",
      "Created At"
    ];

    const rows = leadsList.map((lead: any) => [
      lead.leadNumber || "",
      lead.status || "",
      lead.source || "",
      lead.notes || "",
      lead.customerName || "",
      lead.email || "",
      lead.mobileNumber || "",
      lead.alternateMobile || "",
      lead.companyName || "",
      lead.gstNumber || "",
      lead.address || "",
      lead.customerData?.distance || lead.leadData?.distance || lead.distance || "",
      lead.city || "",
      lead.state || "",
      lead.country || "",
      lead.pincode || "",
      lead.customerType || "",
      lead.contactPerson || "",
      lead.productName || "",
      lead.productCode || "",
      lead.category || "",
      lead.brand || "",
      lead.unit || "",
      lead.price || 0,
      lead.tax || 0,
      lead.stockQuantity || 0,
      lead.description || "",
      lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : "Unassigned",
      lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ""
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    
    // Explicitly set phone and number columns as strings
    const stringColIndices = [6, 7, 9, 14, 18]; // Mobile, Alternate Mobile, GST, Pincode, Product Code
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:AB1000');
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      stringColIndices.forEach(c => {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        if (ws[cellAddress]) {
          ws[cellAddress].t = 's';
          ws[cellAddress].z = '@';
        }
      });
    }

    // Dynamic auto-fit column widths based on maximum length of cell contents
    ws['!cols'] = headers.map((header, colIdx) => {
      let maxLen = header.length;
      rows.forEach(row => {
        const valStr = String(row[colIdx] !== undefined && row[colIdx] !== null ? row[colIdx] : "");
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      });
      return { wch: Math.max(maxLen + 4, 12) }; // Add 4 characters padding, min width 12
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads Data");
    XLSX.writeFile(wb, `leads_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Leads exported to Excel successfully!");
  };

  const handleImportCSV = async () => {
    const file = selectedImportFile;
    if (!file) {
      toast.error("Please select an Excel or CSV file to upload");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      if (!data) return;

      let importToastId: string | number | undefined;

      try {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsed: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (parsed.length < 2) {
          toast.error("Excel file is empty or missing headers");
          return;
        }

        const headers = parsed[0].map((h: any) => String(h || "").trim().toLowerCase());
        const rows = parsed.slice(1);

        let successCount = 0;
        let failCount = 0;
        let skippedDuplicateCount = 0;
        const importedSignatures = new Set<string>();

        importToastId = toast.loading(`Starting import of ${rows.length} leads...`);

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const isEmptyRow = row.every((cell) => String(cell !== undefined && cell !== null ? cell : "").trim() === "");
          if (row.length === 0 || isEmptyRow) continue;

          const leadObj: any = {};
          headers.forEach((header, index) => {
            const rawVal = row[index] !== undefined && row[index] !== null ? row[index] : "";
            const val = String(rawVal).trim();
            if (header === "lead number" || header === "leadid" || header === "lead_number") leadObj.leadNumber = val;
            else if (header === "status" || header === "lead_status" || header === "lead status") leadObj.status = val.toUpperCase().replace(" ", "_") || "OPEN";
            else if (header === "source") leadObj.source = val.toUpperCase().replace(" ", "_") || "OTHER";
            else if (header === "notes" || header === "call_status" || header === "calling status") leadObj.notes = val;
            else if (header === "customer name" || header === "name" || header === "customers name") leadObj.customerName = val;
            else if (header === "email") leadObj.email = val;
            else if (header === "mobile number" || header === "phone" || header === "contact" || header === "phone number") leadObj.mobileNumber = val;
            else if (header === "alternate mobile" || header === "alternate_mobile") leadObj.alternateMobile = val;
            else if (header === "company name" || header === "company") leadObj.companyName = val;
            else if (header === "gst number" || header === "gst") leadObj.gstNumber = val;
            else if (header === "address") leadObj.address = val;
            else if (header === "distance") leadObj.distance = val;
            else if (header === "city" || header === "villaage" || header === "village") leadObj.city = val;
            else if (header === "state" || header === "taluka") leadObj.state = val;
            else if (header === "country" || header === "district" || header === "dist") leadObj.country = val;
            else if (header === "pincode" || header === "zip") leadObj.pincode = val;
            else if (header === "customer type" || header === "type") leadObj.customerType = val;
            else if (header === "contact person" || header === "contact_person") leadObj.contactPerson = val;
            else if (header === "product name" || header === "product") leadObj.productName = val;
            else if (header === "product code" || header === "sku") leadObj.productCode = val;
            else if (header === "category") leadObj.category = val;
            else if (header === "brand") leadObj.brand = val;
            else if (header === "unit") leadObj.unit = val;
            else if (header === "price" || header === "rate") leadObj.price = parseFloat(val) || 0;
            else if (header === "tax") leadObj.tax = parseFloat(val) || 0;
            else if (header === "stock quantity" || header === "qty" || header === "qty/tones" || header === "order qty") leadObj.stockQuantity = parseInt(val) || 0;
            else if (header === "description") leadObj.description = val;
            // Custom Lead/Enquiry attributes
            else if (header === "no. of cattle" || header === "no of cattle") leadObj.noOfCattle = val;
            else if (header === "monthly using") leadObj.monthlyUsing = val;
            else if (header === "need qty") leadObj.needQty = val;
            else if (header === "follow-up date" || header === "followup date") leadObj.followupDate = val;
          });

          if (!leadObj.customerName) {
            leadObj.customerName = leadObj.companyName || leadObj.contactPerson || leadObj.mobileNumber || leadObj.email || "Unknown Customer";
          }

          const sigName = (leadObj.customerName || "").trim().toLowerCase();
          const sigPhone = (leadObj.mobileNumber || "").trim();
          const sigEmail = (leadObj.email || "").trim().toLowerCase();
          const signature = `${sigName}_${sigPhone}_${sigEmail}`;

          if (importedSignatures.has(signature)) {
            skippedDuplicateCount++;
            continue;
          }

          const isExisting = leadsList.some((existingLead: any) => {
             const eName = (existingLead.customerName || "").trim().toLowerCase();
             const ePhone = (existingLead.mobileNumber || "").trim();
             const eEmail = (existingLead.email || "").trim().toLowerCase();
             
             if (eName === sigName) {
                if (sigPhone && ePhone === sigPhone) return true;
                if (sigEmail && eEmail === sigEmail) return true;
                if (!sigPhone && !sigEmail) return true;
             }
             return false;
          });

          if (isExisting) {
            skippedDuplicateCount++;
            continue;
          }

          importedSignatures.add(signature);

          let mappedStatus = "OPEN";
          const rawStatus = (leadObj.status || "").toUpperCase().replace(/\s+/g, '_');
          if (["OPEN", "IN_PROGRESS", "WON", "LOST"].includes(rawStatus)) {
             mappedStatus = rawStatus;
          } else if (rawStatus === "INPROGRESS") {
             mappedStatus = "IN_PROGRESS";
          } else if (rawStatus.includes("WON") || rawStatus.includes("CLOSED") || rawStatus === "SALE" || rawStatus === "INVOICE") {
             mappedStatus = "WON";
          }

          let mappedSource = "OTHER";
          const rawSource = (leadObj.source || "").toUpperCase().replace(/\s+/g, '_');
          if (["META_ADS", "GOOGLE_ADS", "REFERRAL", "WEBSITE", "OTHER"].includes(rawSource)) {
             mappedSource = rawSource;
          } else if (rawSource === "FACEBOOK" || rawSource === "INSTAGRAM") {
             mappedSource = "META_ADS";
          }
          
          let validEmail = undefined;
          if (leadObj.email && typeof leadObj.email === 'string' && leadObj.email.includes('@')) {
             validEmail = leadObj.email;
          }

          const payload = {
            status: mappedStatus,
            source: mappedSource,
            notes: String(leadObj.notes || ""),
            customerName: String(leadObj.customerName || ""),
            email: validEmail,
            mobileNumber: String(leadObj.mobileNumber || ""),
            alternateMobile: String(leadObj.alternateMobile || ""),
            companyName: String(leadObj.companyName || ""),
            gstNumber: String(leadObj.gstNumber || ""),
            address: String(leadObj.address || ""),
            city: String(leadObj.city || ""),
            state: String(leadObj.state || ""),
            country: String(leadObj.country || ""),
            pincode: String(leadObj.pincode || ""),
            customerType: String(leadObj.customerType || "Retail"),
            contactPerson: String(leadObj.contactPerson || ""),
            productName: String(leadObj.productName || "Product"),
            productCode: String(leadObj.productCode || ""),
            category: String(leadObj.category || "General"),
            brand: String(leadObj.brand || ""),
            unit: String(leadObj.unit || ""),
            price: Number(leadObj.price) || 0,
            tax: Number(leadObj.tax) || 0,
            stockQuantity: Math.floor(Number(leadObj.stockQuantity)) || 0,
            description: String(leadObj.description || ""),
            customerData: {
              name: String(leadObj.customerName || ""),
              phone: String(leadObj.mobileNumber || ""),
              type: String(leadObj.customerType || "Retail"),
              noOfCattle: String(leadObj.noOfCattle || ""),
              monthlyUsing: String(leadObj.monthlyUsing || ""),
              needQty: String(leadObj.needQty || ""),
              villaage: String(leadObj.city || ""),
              taluka: String(leadObj.state || ""),
              district: String(leadObj.country || ""),
              distance: String(leadObj.distance || "")
            },
            leadData: {
              notes: String(leadObj.notes || ""),
              vehicleType: "Other",
              noOfCattle: String(leadObj.noOfCattle || ""),
              monthlyUsing: String(leadObj.monthlyUsing || ""),
              needQty: String(leadObj.needQty || ""),
              followupDate: String(leadObj.followupDate || ""),
            },
            productData: {
              selectedProducts: [{
                name: String(leadObj.productName || "Product"),
                price: Number(leadObj.price) || 0,
                tax: Number(leadObj.tax) || 0,
                qty: Math.floor(Number(leadObj.stockQuantity)) || 1,
                category: String(leadObj.category || "General"),
                description: String(leadObj.description || ""),
                afterDiscountPrice: (Number(leadObj.price) || 0) * (Math.floor(Number(leadObj.stockQuantity)) || 1)
              }]
            }
          };

          try {
            const created = await leadsService.createLead(payload);
            successCount++;
            
            // If follow-up date is provided, automatically schedule a follow-up call event in the DB!
            if (leadObj.followupDate && created?.id) {
              try {
                let callDateStr = new Date(leadObj.followupDate).toISOString().slice(0, 10);
                if (callDateStr && callDateStr !== "NaN-NaN-NaN") {
                  await leadsService.createFollowup(created.id, {
                    callDate: callDateStr,
                    callTime: "10:00",
                    callType: "Outgoing",
                    conversation: leadObj.notes || "Imported Scheduled Follow-up",
                    nextFollowupDate: callDateStr,
                    assignedEmployee: "",
                  });
                }
              } catch (fErr) {
                console.error("Failed to automatically create followup for imported row:", fErr);
              }
            }

            if (importToastId) toast.loading(`Importing leads... (${successCount}/${rows.length})`, { id: importToastId });
          } catch (err: any) {
            console.error(`Row ${i} import failed`, err?.response?.data || err);
            if (err?.response?.data?.message) {
              const msg = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
              console.error(`Validation Error: ${msg}`);
              if (!window.sessionStorage.getItem('firstImportError')) {
                 window.sessionStorage.setItem('firstImportError', 'true');
                 toast.error(`Validation error on row ${i + 1}: ${msg}`);
              }
            }
            failCount++;
          }
        }

        window.sessionStorage.removeItem('firstImportError');
        if (importToastId) toast.dismiss(importToastId);
        setIsImportModalOpen(false);
        setSelectedImportFile(null);
        if (successCount > 0) {
          toast.success(`Successfully imported ${successCount} leads!`);
          loadData();
        }
        if (skippedDuplicateCount > 0) {
          toast.info(`Skipped ${skippedDuplicateCount} duplicate leads.`);
        }
        if (failCount > 0) {
          toast.error(`${failCount} rows failed to import due to validation errors.`);
        }
      } catch (error: any) {
        if (importToastId) toast.dismiss(importToastId);
        toast.error(`Failed to parse Excel file: ${error?.message || "Unknown error"}`);
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leads & Enquiry Hub</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Automate customer leads, schedule follow-ups, and track closures</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={openSchemaSettings} variant="secondary" className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-semibold text-slate-600 flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Manage Columns
          </Button>
          <Button onClick={() => { setIsImportModalOpen(true); setSelectedImportFile(null); }} variant="secondary" className="h-11 px-4 rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-semibold text-slate-600 flex items-center">
            <Upload className="w-4 h-4 mr-2 text-emerald-600" />
            Import
          </Button>
          <Button onClick={handleExportCSV} variant="secondary" className="h-11 px-4 rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-semibold text-slate-600 flex items-center">
            <Download className="w-4 h-4 mr-2 text-indigo-600" />
            Export
          </Button>
          <Button onClick={handleAddNew} variant="primary" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100/50 h-11 px-6 rounded-xl transition-all active:scale-95 flex items-center font-bold">
            <Plus className="w-5 h-5 mr-2" />
            Create New Lead
          </Button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Enquiries', value: dashboardStats.totalLeads, color: 'text-indigo-600 border-indigo-100', icon: Database, bg: 'bg-indigo-50/50', filterKey: 'ALL', ringColor: 'ring-2 ring-indigo-500 border-transparent shadow-indigo-100/50' },
          { label: 'In Progress', value: dashboardStats.inProgressLeads, color: 'text-orange-600 border-orange-100', icon: Clock, bg: 'bg-orange-50/50', filterKey: 'ACTIVE_PIPELINE', ringColor: 'ring-2 ring-orange-500 border-transparent shadow-orange-100/50' },
          { label: 'Won / Closed', value: dashboardStats.wonLeads, color: 'text-emerald-600 border-emerald-100', icon: CheckCircle2, bg: 'bg-emerald-50/50', filterKey: 'WON_CLOSED', ringColor: 'ring-2 ring-emerald-500 border-transparent shadow-emerald-100/50' },
          { label: 'Today / Total Follow-ups', value: `${dashboardStats.todayFollowups} / ${dashboardStats.totalFollowups || 0}`, color: 'text-rose-600 border-rose-100', icon: Phone, bg: 'bg-rose-50/50', filterKey: 'TODAY_FOLLOWUPS', ringColor: 'ring-2 ring-rose-500 border-transparent shadow-rose-100/50' },
          { label: 'Sales Converted', value: dashboardStats.convertedSales, color: 'text-blue-600 border-blue-100', icon: Landmark, bg: 'bg-blue-50/50', filterKey: 'CONVERTED', ringColor: 'ring-2 ring-blue-500 border-transparent shadow-blue-100/50' },
        ].map((stat, idx) => {
          const isActive = activeFilter === stat.filterKey;
          return (
            <Card
              key={idx}
              onClick={() => setActiveFilter(stat.filterKey)}
              className={`border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 ${
                isActive ? `${stat.ringColor} scale-[1.02]` : ''
              }`}
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-extrabold ${stat.color.split(' ')[0]} mb-0.5 tracking-tight`}>{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color.split(' ')[0]} border ${stat.color.split(' ')[1]}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Leads Table */}
      <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden bg-white">
        <CardHeader className="px-8 py-5 border-b border-slate-100/80 bg-slate-50/20 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800 flex flex-wrap items-center gap-6">
            {activeFilter === "TODAY_FOLLOWUPS" ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-base font-bold text-slate-800">Follow-up Enquiries:</span>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setFollowupViewMode("today")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all active:scale-95 cursor-pointer ${
                      followupViewMode === "today"
                        ? "bg-white text-rose-600 shadow-sm border border-slate-200/40"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Today's Scheduled
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowupViewMode("total")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all active:scale-95 cursor-pointer ${
                      followupViewMode === "total"
                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200/40"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Total Follow-ups
                  </button>
                </div>
              </div>
            ) : (
              <>
                {activeFilter === "ALL" && "All Registered Leads"}
                {activeFilter === "ACTIVE_PIPELINE" && "In Progress Leads"}
                {activeFilter === "WON_CLOSED" && "Won & Closed Leads"}
                {activeFilter === "CONVERTED" && "Converted Sales Leads"}
              </>
            )}

            <div className="flex items-center gap-2 border-l border-slate-200 pl-6 h-6">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Call Status:</span>
              <select
                value={callStatusFilter}
                onChange={(e) => setCallStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm hover:border-slate-300 transition-all cursor-pointer"
              >
                <option value="ALL">All Call Statuses</option>
                <option value="Connected">Connected</option>
                <option value="Not Connected">Not Connected</option>
                <option value="Out of Service">Out of Service</option>
                <option value="Busy">Busy</option>
              </select>
            </div>
          </CardTitle>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
            {filteredLeadsList.length} {filteredLeadsList.length === 1 ? 'Lead' : 'Leads'}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredLeadsList}
            onEdit={handleEdit}
            onView={handleView}
            onLogCall={handleOpenLogCallModal}
            searchPlaceholder="Search leads by customer, product, or representative..."
          />
        </CardContent>
      </Card>

      {/* Import Leads Modal */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Leads" size="md">
        <div className="p-6 space-y-6 flex flex-col items-center">
          {/* Download Sample Section */}
          <div className="w-full text-center space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
            <p className="text-sm font-medium text-slate-500">
              Download our pre-formatted Excel template to ensure your data matches the CRM layout.
            </p>
            <Button
              onClick={handleDownloadSampleCSV}
              variant="secondary"
              className="bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/50 text-emerald-800 font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 mx-auto transition-all active:scale-95 shadow-sm shadow-emerald-50/50"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              Download Sample
            </Button>
          </div>

          {/* Upload File Section */}
          <div className="w-full space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              Upload Excel / CSV File
            </h4>
            <div className="flex items-center gap-4 border border-slate-100 rounded-xl p-4 bg-slate-50/30">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Select File</span>
              <div className="flex-1 flex items-center gap-3">
                <label className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm shadow-sm transition-all active:scale-95">
                  Choose File
                  <input
                    type="file"
                    onChange={(e) => setSelectedImportFile(e.target.files?.[0] || null)}
                    accept=".csv, .xlsx, .xls"
                    className="hidden"
                  />
                </label>
                <span className="text-sm font-medium text-slate-600 truncate max-w-[200px]">
                  {selectedImportFile ? selectedImportFile.name : "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full pt-4">
            <Button
              onClick={handleImportCSV}
              disabled={!selectedImportFile}
              variant="primary"
              className={`w-full font-bold h-11 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                selectedImportFile
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100/50 active:scale-95"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200"
              }`}
            >
              <Upload className="w-4 h-4" />
              Submit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Lead Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedLead ? "Edit Lead Details" : "Create New Lead"} size="xl">
        <form onSubmit={handleSubmit} className="px-2">
          <div className="space-y-6">
            
            {/* Step 1: Customer Master Search & Selector */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-slate-400" />
                1. Customer Details
              </h3>
              
              {/* Customer autofilled form grid */}
              <div className="grid grid-cols-2 gap-4">
                {isNewCustomer ? (
                  <div className="flex flex-col gap-1">
                    <Input
                      label="Customer Name"
                      required
                      value={formData.customerName || ""}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          customerName: e.target.value,
                          customerData: { ...(formData.customerData || {}), name: e.target.value }
                        });
                      }}
                      placeholder="Enter new customer name"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewCustomer(false);
                        setFormData({ ...formData, customerId: "", customerName: "", email: "", mobileNumber: "", address: "" });
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 text-left font-semibold mt-1 self-start"
                    >
                      ← Select Existing Customer
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <SearchableCustomerSelect
                      label="Customer Name"
                      required
                      value={formData.customerId?.toString() || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "new") {
                          setIsNewCustomer(true);
                          setFormData({ 
                            ...formData, 
                            customerId: "", 
                            customerName: "", 
                            email: "", 
                            mobileNumber: "", 
                            address: "",
                            customerData: {} 
                          });
                        } else {
                          const id = parseInt(val);
                          if (id) {
                            handleCustomerSelect(id);
                          } else {
                            setFormData({ ...formData, customerId: "", customerName: "", email: "", mobileNumber: "", address: "" });
                          }
                        }
                      }}
                      customers={customers}
                      placeholder="Select Customer..."
                    />
                  </div>
                )}
                {customerConfig && customerConfig.length > 0 ? (
                  customerConfig.map((field: any) => {
                    if (field.key === 'name' || field.key === 'customerName') return null;
                    
                    const commonProps = {
                      key: field.key,
                      label: field.label,
                      required: field.validationRules?.required,
                      value: formData.customerData?.[field.key] || formData[field.key as keyof typeof formData] || "",
                      onChange: (e: any) => {
                        const val = field.dataType === 'checkbox' ? e.target.checked : e.target.value;
                        setFormData({ 
                          ...formData, 
                          customerData: { ...(formData.customerData || {}), [field.key]: val },
                          [field.key]: val
                        });
                      },
                      placeholder: `Enter ${field.label.toLowerCase()}`,
                      className: field.dataType === 'paragraph' ? "col-span-2" : ""
                    };
                    
                    switch (field.dataType) {
                      case 'paragraph': return <TextArea {...commonProps} />;
                      case 'dropdown': return <Select {...commonProps} options={field.options?.map((opt: string) => ({ value: opt, label: opt })) || []} />;
                      case 'checkbox': return <div key={field.key} className="flex items-center gap-2 py-6"><input type="checkbox" checked={!!commonProps.value} onChange={commonProps.onChange} /><label className="text-sm font-medium text-gray-700">{field.label}</label></div>;
                      case 'date': return <Input {...commonProps} type="date" />;
                      default: return <Input {...commonProps} type={field.dataType === 'number' ? 'number' : 'text'} />;
                    }
                  })
                ) : (
                  <p className="text-sm text-slate-400 col-span-2">No custom fields configured in Master.</p>
                )}
              </div>
            </div>

            {/* Step 2: Product Master Search & Selector */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" />
                2. Product Details
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableProductSelect
                    label="Add Product"
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "new") {
                        setSelectedProducts(prev => [
                          ...prev,
                          {
                            id: -1 * Date.now(),
                            name: "",
                            sku: "",
                            category: "General",
                            brand: "",
                            unit: "",
                            price: 0,
                            tax: 0,
                            stockQuantity: 0,
                            description: "",
                            productData: {},
                            qty: 1,
                            discountPercent: 0,
                            discountAmount: 0,
                            afterDiscountPrice: 0
                          }
                        ]);
                      } else {
                        const id = parseInt(val);
                        if (id) {
                          handleAddProduct(id);
                        }
                      }
                    }}
                    products={products.filter(p => !selectedProducts.some(sp => sp.id === p.id))}
                    placeholder="Select Product to Add..."
                  />
                </div>

                {/* Selected Products Grid List */}
                {selectedProducts.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Selected Products ({selectedProducts.length})
                    </span>
                    <div className="bg-white rounded-xl border border-slate-200/60 overflow-x-auto overflow-y-hidden max-w-full">
                      <table className="w-full text-xs min-w-[1000px]">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/40 font-bold uppercase text-[10px] whitespace-nowrap">
                          <tr>
                            <th className="px-3 py-2.5 text-left">Product</th>
                            <th className="px-3 py-2.5 text-left">SKU</th>
                            <th className="px-3 py-2.5 text-left">Category</th>
                            <th className="px-3 py-2.5 text-left">Description</th>
                            {/* Render custom product columns dynamically */}
                            {productConfig && productConfig.map((field: any) => {
                              if (['name', 'productName', 'sku', 'productCode', 'category', 'brand', 'unit', 'price', 'tax', 'stockQuantity', 'description'].includes(field.key)) {
                                return null;
                              }
                              
                              const custType = (formData.type || formData.customerData?.type || formData.customerType || "").toLowerCase();
                              const isRetail = custType.includes("retail") || custType.includes("customer");
                              const isWholesale = custType.includes("wholesale") || custType.includes("dealer");
                              
                              if (field.key === 'dealerRate' && isRetail) return null;
                              if (field.key === 'customerRate' && isWholesale) return null;

                              return (
                                <th key={field.key} className="px-3 py-2.5 text-left">{field.label}</th>
                              );
                            })}
                            <th className="px-3 py-2.5 text-center w-16">Qty</th>
                            <th className="px-3 py-2.5 text-right w-24">Price</th>
                            <th className="px-3 py-2.5 text-center w-20">Discount %</th>
                            <th className="px-3 py-2.5 text-right w-24">Discount Amt</th>
                            <th className="px-3 py-2.5 text-right">After Discount</th>
                            <th className="px-3 py-2.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium whitespace-nowrap">
                          {selectedProducts.map((p) => {
                            const qty = p.qty ?? 1;
                            const price = p.price ?? 0;
                            const discountPercent = p.discountPercent ?? 0;
                            const discountAmount = p.discountAmount ?? 0;
                            const afterDiscountPrice = p.afterDiscountPrice ?? (price * qty);

                            return (
                              <tr key={p.id} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={p.name || ""}
                                    onChange={(e) => updateProductRow(p.id, 'name', e.target.value)}
                                    className="w-28 px-1.5 py-0.5 text-xs border border-slate-200 rounded font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={p.sku || ""}
                                    onChange={(e) => updateProductRow(p.id, 'sku', e.target.value)}
                                    className="w-24 px-1.5 py-0.5 text-xs border border-slate-200 rounded font-mono text-[10px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                    placeholder="N/A"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <select
                                    value={p.category || "General"}
                                    onChange={(e) => updateProductRow(p.id, 'category', e.target.value)}
                                    className="w-28 px-1.5 py-0.5 text-xs border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                  >
                                    <option value="General">General</option>
                                    <option value="Feed">Feed</option>
                                    <option value="Medicine">Medicine</option>
                                    <option value="Equipment">Equipment</option>
                                    <option value="Chicks">Chicks</option>
                                  </select>
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="text"
                                    value={p.description || ""}
                                    onChange={(e) => updateProductRow(p.id, 'description', e.target.value)}
                                    className="w-36 px-1.5 py-0.5 text-xs border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                    placeholder="N/A"
                                  />
                                </td>
                                {/* Render custom product column values dynamically */}
                                {productConfig && productConfig.map((field: any) => {
                                  if (['name', 'productName', 'sku', 'productCode', 'category', 'brand', 'unit', 'price', 'tax', 'stockQuantity', 'description'].includes(field.key)) {
                                    return null;
                                  }
                                  
                                  const custType = (formData.type || formData.customerData?.type || formData.customerType || "").toLowerCase();
                                  const isRetail = custType.includes("retail") || custType.includes("customer");
                                  const isWholesale = custType.includes("wholesale") || custType.includes("dealer");
                                  
                                  if (field.key === 'dealerRate' && isRetail) return null;
                                  if (field.key === 'customerRate' && isWholesale) return null;

                                  const customVal = p[field.key] !== undefined ? p[field.key] : (p.productData?.[field.key] ?? "");
                                  return (
                                    <td key={field.key} className="px-3 py-2">
                                      <input
                                        type={field.dataType === 'number' ? 'number' : 'text'}
                                        value={customVal}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          updateProductRow(p.id, field.key, val);
                                          
                                          if ((field.key === 'dealerRate' && isWholesale) || (field.key === 'customerRate' && isRetail)) {
                                            updateProductRow(p.id, 'price', val);
                                          }
                                        }}
                                        className={`px-1.5 py-0.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white ${field.dataType === 'number' ? 'w-20 text-right font-bold' : 'w-28'}`}
                                      />
                                    </td>
                                  );
                                })}
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="number"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => updateProductRow(p.id, 'qty', e.target.value)}
                                    className="w-14 px-1 py-0.5 text-xs border border-slate-200 rounded text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => updateProductRow(p.id, 'price', e.target.value)}
                                    className="w-20 px-1 py-0.5 text-xs border border-slate-200 rounded text-right font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={discountPercent}
                                    onChange={(e) => updateProductRow(p.id, 'discountPercent', e.target.value)}
                                    className="w-16 px-1 py-0.5 text-xs border border-slate-200 rounded text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discountAmount}
                                    onChange={(e) => updateProductRow(p.id, 'discountAmount', e.target.value)}
                                    className="w-20 px-1 py-0.5 text-xs border border-slate-200 rounded text-right font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                </td>
                                <td className="px-3 py-2 text-right font-bold text-indigo-900">{afterDiscountPrice.toFixed(2)}</td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(p.id)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-slate-50/50 border-t border-slate-100 font-bold text-xs text-slate-700">
                          {(() => {
                            const dynamicColSpan = 4 + (productConfig ? productConfig.filter((field: any) => !['name', 'productName', 'sku', 'productCode', 'category', 'brand', 'unit', 'price', 'tax', 'stockQuantity', 'description'].includes(field.key)).length : 0) + 4;
                            return (
                              <>
                                <tr className="border-b border-slate-100">
                                  <td colSpan={dynamicColSpan} className="px-4 py-2 text-right uppercase tracking-wider text-[10px] text-slate-400 font-bold">Total After Discount</td>
                                  <td className="px-4 py-2 text-right text-indigo-900 font-bold">
                                    {selectedProducts.reduce((sum, p) => sum + (p.afterDiscountPrice ?? (p.price * (p.qty ?? 1))), 0).toFixed(2)}
                                  </td>
                                  <td></td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                  <td colSpan={dynamicColSpan} className="px-4 py-2 text-right uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                                    Transportation Cost
                                  </td>
                                  <td className="px-4 py-1 text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={formData.transportationCost || ""}
                                      onChange={(e) => setFormData({ ...formData, transportationCost: parseFloat(e.target.value) || 0 })}
                                      placeholder="0.00"
                                      className="w-20 px-2 py-0.5 text-xs border border-slate-200 rounded text-right font-bold text-indigo-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </td>
                                  <td></td>
                                </tr>
                                <tr className="bg-indigo-50/30 text-indigo-900">
                                  <td colSpan={dynamicColSpan} className="px-4 py-2.5 text-right uppercase tracking-wider text-[10px] font-extrabold">Total Bill</td>
                                  <td className="px-4 py-2.5 text-right text-sm font-extrabold text-indigo-600">
                                    {(selectedProducts.reduce((sum, p) => sum + (p.afterDiscountPrice ?? (p.price * (p.qty ?? 1))), 0) + (parseFloat(formData.transportationCost as any) || 0)).toFixed(2)}
                                  </td>
                                  <td></td>
                                </tr>
                              </>
                            );
                          })()}
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                    No products selected yet. Add products using the selector above.
                  </div>
                )}

              </div>
            </div>

            {/* Step 3: Lead Details */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-400" />
                3. Lead Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee assignment is strictly hardcoded due to dynamic DB relations */}
                <Select 
                  label="Assign Employee" 
                  required 
                  value={formData.assignedToId?.toString()} 
                  onChange={(e) => setFormData({ ...formData, assignedToId: parseInt(e.target.value) })}
                  options={[
                    { value: "", label: "Select Employee..." },
                    ...eligibleStaff.map(s => ({ value: s.id.toString(), label: `${s.firstName} ${s.lastName}` }))
                  ]}
                />

                <Select 
                  label="Lead Status" 
                  value={formData.status || "OPEN"} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: "OPEN", label: "Open" },
                    { value: "IN_PROGRESS", label: "In Progress" },
                    { value: "WON", label: "Won" },
                    { value: "LOST", label: "Lost" }
                  ]}
                />

                <Select 
                  label="Lead Source" 
                  value={formData.source || "OTHER"} 
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  options={[
                    { value: "META_ADS", label: "Meta Ads" },
                    { value: "GOOGLE_ADS", label: "Google Ads" },
                    { value: "REFERRAL", label: "Referral" },
                    { value: "WEBSITE", label: "Website" },
                    { value: "OTHER", label: "Other" }
                  ]}
                />

                <Select 
                  label="Call Status" 
                  value={formData.callStatus || "Connected"} 
                  onChange={(e) => setFormData({ ...formData, callStatus: e.target.value })}
                  options={[
                    { value: "Connected", label: "Connected" },
                    { value: "Not Connected", label: "Not Connected" },
                    { value: "Out of Service", label: "Out of Service" },
                    { value: "Busy", label: "Busy" }
                  ]}
                />

                {leadConfig && leadConfig.length > 0 ? (
                  leadConfig.map((field: any) => {
                    // Skip native fields that are already hardcoded in the 3 sections
                    if ([
                      'customerName', 'mobileNumber', 'email', 'address', 'city', 'state', 'country', 'pincode', 'customerType',
                      'productName', 'productCode', 'category', 'price', 'stockQuantity', 'assignedToId',
                      'source', 'status', 'callStatus'
                    ].includes(field.key)) {
                      return null;
                    }
                    const commonProps = {
                      key: field.key,
                      label: field.label,
                      required: field.validationRules?.required,
                      value: formData.leadData?.[field.key] || formData[field.key as keyof typeof formData] || "",
                      onChange: (e: any) => {
                        const val = field.dataType === 'checkbox' ? e.target.checked : e.target.value;
                        setFormData({ 
                          ...formData, 
                          leadData: { ...(formData.leadData || {}), [field.key]: val },
                          [field.key]: val // sync back to native fields for compatibility
                        });
                      },
                      placeholder: `Enter ${field.label.toLowerCase()}`,
                      className: field.dataType === 'paragraph' ? "col-span-2 md:col-span-2" : ""
                    };
                    
                    switch (field.dataType) {
                      case 'paragraph': return <TextArea {...commonProps} />;
                      case 'dropdown': return <Select {...commonProps} options={field.options?.map((opt: string) => ({ value: opt, label: opt })) || []} />;
                      case 'checkbox': return <div key={field.key} className="flex items-center gap-2 py-6"><input type="checkbox" checked={!!commonProps.value} onChange={commonProps.onChange} /><label className="text-sm font-medium text-gray-700">{field.label}</label></div>;
                      case 'date': return <Input {...commonProps} type="date" />;
                      default: return <Input {...commonProps} type={field.dataType === 'number' ? 'number' : 'text'} />;
                    }
                  })
                ) : (
                  <p className="text-sm text-slate-400 col-span-2 pt-2">No custom lead fields configured.</p>
                )}
              </div>
            </div>

              {/* Schedule Call Option Toggle */}
              <div className="pt-4 mt-4 border-t border-slate-200/50">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={scheduleCall}
                    onChange={(e) => setScheduleCall(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Schedule Next Call / Follow-up
                  </span>
                </label>

                {scheduleCall && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                    <Input
                      label="Scheduled Date"
                      type="date"
                      required
                      value={scheduledCallData.callDate}
                      onChange={(e) => setScheduledCallData({ ...scheduledCallData, callDate: e.target.value })}
                    />
                    <Input
                      label="Scheduled Time"
                      type="time"
                      required
                      value={scheduledCallData.callTime}
                      onChange={(e) => setScheduledCallData({ ...scheduledCallData, callTime: e.target.value })}
                    />
                    <Select
                      label="Call / Follow-up Type"
                      required
                      value={scheduledCallData.callType}
                      onChange={(e) => setScheduledCallData({ ...scheduledCallData, callType: e.target.value })}
                      options={[
                        { value: "Outgoing", label: "Outgoing Call" },
                        { value: "Incoming", label: "Incoming Call" },
                        { value: "Meeting", label: "Meeting" },
                        { value: "Demo", label: "Demo" },
                      ]}
                    />
                  </div>
                )}
              </div>
          </div>

          <ModalFooter className="mt-8 border-t-0 px-0">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl px-8 h-12 bg-slate-100 text-slate-600">Cancel</Button>
            <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700 rounded-xl px-10 h-12 shadow-lg shadow-blue-100">
               {selectedLead ? "Save Changes" : "Save & Create Lead"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Activity Timeline and Call Log Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Lead Activity & History: ${selectedLead?.customerName || 'Lead View'}`} size="xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-1">
          
          {/* Left Column: Lead Overview */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 text-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                <span className="font-bold text-slate-400 uppercase tracking-widest">Lead Status</span>
                <Badge variant={selectedLead?.status === 'WON' ? 'success' : selectedLead?.status === 'IN_PROGRESS' ? 'warning' : 'info'}>
                  {selectedLead?.status === 'WON' ? 'WON/CLOSED' : selectedLead?.status}
                </Badge>
              </div>

              {/* Status workflow transitions */}
              <div className="space-y-1">
                <span className="font-semibold text-slate-500 block mb-2">Workflow Actions</span>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" size="sm" variant="outline" className="text-[10px] py-1 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100/50" onClick={() => handleStatusChangeClick("IN_PROGRESS")}>
                    Set In Progress
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="text-[10px] py-1 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50" onClick={() => handleStatusChangeClick("WON")}>
                    Won (Convert to Sales)
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="text-[10px] py-1 border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100/50 col-span-2" onClick={() => handleStatusChangeClick("LOST")}>
                    Close as Lost
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/50 space-y-2">
                <div>
                  <span className="text-slate-400 block">Customer Name</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedLead?.customerName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-semibold text-slate-800">{selectedLead?.mobileNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email</span>
                  <span className="font-semibold text-slate-800 break-all">{selectedLead?.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Region</span>
                  <span className="font-semibold text-slate-800">{selectedLead?.state || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Customer Type</span>
                  <span className="font-semibold text-slate-800 uppercase">{selectedLead?.customerType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Address</span>
                  <span className="font-semibold text-slate-800">{selectedLead?.address || 'N/A'}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/50">
                  <span className="text-slate-400 block mb-1">Product Interest</span>
                  {selectedLead?.productData?.selectedProducts && Array.isArray(selectedLead.productData.selectedProducts) && selectedLead.productData.selectedProducts.length > 0 ? (
                    <div className="space-y-2 mt-1.5">
                      {selectedLead.productData.selectedProducts.map((p: any, idx: number) => (
                        <div key={idx} className="flex flex-col bg-white p-2.5 rounded-lg border border-slate-100/80 gap-1.5 shadow-sm">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-indigo-900 text-xs leading-tight pr-2">{p.name || p.productName}</span>
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 whitespace-nowrap">
                              {p.sku || p.productCode || 'No SKU'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">Qty: {p.qty || 1}</span>
                            <span className="font-bold text-emerald-600">₹{p.price ? Number(p.price).toFixed(2) : '0.00'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 mt-1.5">
                      <span className="font-bold text-indigo-900">{selectedLead?.productName || 'N/A'}</span>
                      {selectedLead?.productName && (
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium mt-0.5">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">Qty: {selectedLead?.stockQuantity || 1}</span>
                          <span className="font-bold text-emerald-600">₹{selectedLead?.price ? Number(selectedLead.price).toFixed(2) : '0.00'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block">Assigned Staff</span>
                  <span className="font-semibold text-slate-800">{selectedLead?.assignedTo ? `${selectedLead.assignedTo.firstName} ${selectedLead.assignedTo.lastName}` : 'Unassigned'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Timelines */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Conversation Log & History timeline */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                Lead History & Call Reschedule Timeline
              </h3>

              <div className="relative border-l-2 border-slate-100 pl-6 space-y-5 max-h-[500px] overflow-y-auto pr-2 py-2 scrollbar-thin">
                {selectedLead?.history && selectedLead.history.map((hist: any, index: number) => {
                  const getStatusVariant = (status: string) => {
                    const s = (status || "").toUpperCase();
                    if (s === "WON" || s === "WON/CLOSED" || s === "WON (CONVERT TO SALES)") return "success";
                    if (s === "IN_PROGRESS" || s === "IN PROGRESS") return "warning";
                    if (s === "LOST") return "danger";
                    return "info";
                  };

                  const getStatusLabel = (status: string) => {
                    const s = (status || "").toUpperCase();
                    if (s === "WON") return "WON/CLOSED";
                    if (s === "IN_PROGRESS") return "IN PROGRESS";
                    return s;
                  };

                  return (
                    <div key={index} className="relative group">
                      {/* Perfectly centered dot on the line */}
                      <span className="absolute -left-[33px] top-[20px] bg-white border-2 border-indigo-500 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm group-hover:scale-125 transition-all duration-200 z-10" />
                      
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-all duration-200 space-y-3">
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-50">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-700">
                              {hist.changedBy ? `${hist.changedBy.firstName} ${hist.changedBy.lastName}` : 'System'}
                            </span>
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100/30 px-1.5 py-0.5 rounded uppercase">
                              Status Transition
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-350" />
                            {new Date(hist.timestamp).toLocaleDateString()} {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                          <span className="text-slate-400 font-medium">Status transition:</span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={getStatusVariant(hist.oldStatus)} className="text-[9px] font-bold uppercase rounded px-2 py-0.5">
                              {getStatusLabel(hist.oldStatus)}
                            </Badge>
                            <span className="text-slate-400 text-xs">→</span>
                            <Badge variant={getStatusVariant(hist.newStatus)} className="text-[9px] font-bold uppercase rounded px-2 py-0.5">
                              {getStatusLabel(hist.newStatus)}
                            </Badge>
                          </div>
                        </div>

                        {hist.remarks && (
                          <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100/50 font-medium italic mt-1 leading-relaxed">
                            "{hist.remarks}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {followupsList.length === 0 && (!selectedLead?.history || selectedLead.history.length === 0) && (
                  <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                    No lead activities or follow-up logs have been registered.
                  </div>
                )}
              </div>
            </div>

            {/* Call History Details List */}
            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                Call Log History Detail ({followupsList.length} logs)
              </h3>
              
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {followupsList.map((f: any) => (
                  <div key={f.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between items-center font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-500" /> {f.callType} Call</span>
                      <span>{new Date(f.callDate).toLocaleDateString()} {f.callTime}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed bg-white p-2 rounded-lg border border-slate-50">
                      {f.conversation}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                      <span>Logged By: {f.assignedEmployee || 'Representative'}</span>
                      {f.nextFollowupDate && (
                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100/50">Next Follow-up: {new Date(f.nextFollowupDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </Modal>

      {/* Reschedule & Log Call Modal */}
      {(() => {
        const contactNo = selectedLead ? [
          selectedLead.mobileNumber, 
          selectedLead.phone, 
          selectedLead.customerData?.phone, 
          selectedLead.customerData?.mobileNumber, 
          selectedLead.leadData?.phone, 
          selectedLead.leadData?.mobileNumber, 
          selectedLead.customer?.data?.phone, 
          selectedLead.customer?.data?.mobileNumber
        ].find(Boolean) : null;
        
        return (
          <Modal isOpen={isLogCallModalOpen} onClose={() => setIsLogCallModalOpen(false)} title={`Reschedule Call & Log Conversation: ${selectedLead?.customerName || 'Lead'} ${contactNo ? `(${contactNo})` : ''}`} size="xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-1">
          
          {/* Left Column: Log Conversation and Reschedule Form */}
          <div className="md:col-span-6 space-y-4">
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-purple-600" />
                Current Conversation Response
              </h3>
              
              <form onSubmit={handleLogFollowup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Call Type"
                    value={followupForm.callType}
                    onChange={(e) => setFollowupForm({ ...followupForm, callType: e.target.value })}
                    options={[
                      { value: "Outgoing", label: "Outgoing Call" },
                      { value: "Incoming", label: "Incoming Call" },
                      { value: "Meeting", label: "Meeting" },
                      { value: "Demo", label: "Demo" },
                    ]}
                  />

                  <Select
                    label="Call Status"
                    value={followupForm.callStatus || "Connected"}
                    onChange={(e) => setFollowupForm({ ...followupForm, callStatus: e.target.value })}
                    options={[
                      { value: "Connected", label: "Connected" },
                      { value: "Not Connected", label: "Not Connected" },
                      { value: "Out of Service", label: "Out of Service" },
                      { value: "Busy", label: "Busy" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Call Date"
                    type="date"
                    value={followupForm.callDate}
                    onChange={(e) => setFollowupForm({ ...followupForm, callDate: e.target.value })}
                  />

                  <Input
                    label="Call Time"
                    type="time"
                    value={followupForm.callTime}
                    onChange={(e) => setFollowupForm({ ...followupForm, callTime: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Input
                    label="Reschedule Next Date"
                    type="date"
                    placeholder="Next follow-up date"
                    value={followupForm.nextFollowupDate}
                    onChange={(e) => setFollowupForm({ ...followupForm, nextFollowupDate: e.target.value })}
                  />
                </div>

                <TextArea
                  label="Customer Response / Conversation Notes *"
                  required
                  value={followupForm.conversation}
                  onChange={(e) => setFollowupForm({ ...followupForm, conversation: e.target.value })}
                  placeholder="What was the customer's response? Enter details of the call..."
                  className="h-28"
                />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsLogCallModalOpen(false)} className="flex-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-2 font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-100">
                    <CheckCircle2 className="w-4 h-4" />
                    Save & Reschedule
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Timeline of Previous Conversations */}
          <div className="md:col-span-6 space-y-4">
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80 h-[420px] flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-200/50 pb-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Previous Conversations Timeline
              </h3>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {followupsList.length > 0 ? (
                  followupsList.map((f: any) => (
                    <div key={f.id} className="p-3.5 bg-white border border-slate-100 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-md transition-shadow relative">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50/50 border border-indigo-100/30 px-1.5 py-0.5 rounded uppercase">
                            <Phone className="w-3 h-3" /> {f.callType}
                          </span>
                          {f.callStatus && (
                            <span className={`px-1.5 py-0.5 rounded uppercase border font-bold text-[9px] ${
                              f.callStatus === "Connected" ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" :
                              f.callStatus === "Not Connected" ? "bg-rose-50 text-rose-700 border-rose-100/50" :
                              f.callStatus === "Out of Service" ? "bg-amber-50 text-amber-700 border-amber-100/50" :
                              f.callStatus === "Busy" ? "bg-blue-50 text-blue-700 border-blue-100/50" :
                              "bg-slate-50 text-slate-700 border-slate-100/50"
                            }`}>
                              {f.callStatus}
                            </span>
                          )}
                        </div>
                        <span>{new Date(f.callDate).toLocaleDateString()} {f.callTime}</span>
                      </div>
                      
                      <p className="text-slate-700 font-medium text-xs leading-relaxed mb-2 bg-slate-50/30 p-2 rounded-lg border border-slate-100/30 whitespace-pre-wrap">
                        {f.conversation}
                      </p>

                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold border-t border-slate-100/50 pt-1.5">
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <User className="w-3 h-3 text-slate-400" /> {f.assignedEmployee || 'Representative'}
                        </span>
                        {f.nextFollowupDate && (
                          <span className="text-purple-600 bg-purple-50/50 px-2 py-0.5 rounded border border-purple-100/50 flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" /> Next: {new Date(f.nextFollowupDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-indigo-500" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">First Conversation</h4>
                    <p className="text-[11px] text-slate-400 leading-normal max-w-[200px]">
                      No previous call history exists for this customer. Log the first conversation response above!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </Modal>
      );
      })()}

      {/* Status Transition Remarks Prompt Modal */}
      <Modal isOpen={isStatusRemarkModalOpen} onClose={() => setIsStatusRemarkModalOpen(false)} title="Confirm Status Update Workflow" size="sm">
        <div className="space-y-4 text-xs">
          <p className="text-slate-500 font-semibold leading-relaxed">
            Please log a status transition remark. Remarks are tracked automatically in the Lead Timeline and cannot be deleted.
          </p>

          <TextArea
            label="Workflow Remarks / Reason *"
            required
            value={statusRemark}
            onChange={(e) => setStatusRemark(e.target.value)}
            placeholder="e.g. Discussed pricing details, client signed off, customer was unresponsive..."
          />

          <ModalFooter className="px-0 pt-3 border-t-0">
            <Button type="button" variant="ghost" onClick={() => setIsStatusRemarkModalOpen(false)} className="rounded-xl px-5 py-2">
              Cancel
            </Button>
            <Button type="button" variant="primary" className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 py-2 shadow-lg shadow-indigo-100" onClick={submitStatusUpdate}>
              Submit Status Transition
            </Button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Schema Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Manage Lead & Enquiry Columns"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Define the custom data fields for Leads. These will appear in the Lead Creation Form under Additional Details.</p>
          <div className="space-y-2">
            {schemaFields.map((field, index) => (
              <div key={index} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 w-full">
                  <GripVertical className="text-gray-400 cursor-move" />
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <Input placeholder="Label (e.g. Budget)" value={field.label} onChange={(e) => updateSchemaField(index, { label: e.target.value })} />
                    <Input placeholder="Key (e.g. budget)" value={field.key} onChange={(e) => updateSchemaField(index, { key: e.target.value })} />
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
                  <button type="button" onClick={() => removeSchemaField(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
                {field.dataType === "dropdown" && (
                  <div className="pl-8 pr-10 flex items-center gap-3 w-full">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-36 shrink-0">Dropdown Options:</span>
                    <Input 
                      placeholder="Enter options separated by commas (e.g. OPEN, IN_PROGRESS, WON, LOST)" 
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
          <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveSchema} disabled={isSavingSchema}>
            {isSavingSchema ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  );
}
