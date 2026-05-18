import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Phone, Mail, Calendar, User, Eye, Activity, CheckCircle2, Clock, Trash2, Database, MoreVertical, Edit, Search, Tag, AlertCircle, FileText, Landmark, RefreshCw, Settings, GripVertical } from "lucide-react";
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

export function LeadsPage() {
  const dispatch = useDispatch<AppDispatch>();
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
  });

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [followupFilter, setFollowupFilter] = useState<"today" | "upcoming" | "missed" | "completed">("today");
  const [followupsList, setFollowupsList] = useState<any[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusRemarkModalOpen, setIsStatusRemarkModalOpen] = useState(false);
  
  const [selectedLead, setSelectedLead] = useState<any>(null);
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
  });

  // Follow-up logging form states
  const [followupForm, setFollowupForm] = useState({
    callDate: new Date().toISOString().slice(0, 10),
    callTime: new Date().toTimeString().slice(0, 5),
    callType: "Outgoing",
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
    setFormData({
      customerId: "",
      productId: "",
      source: "OTHER",
      assignedToId: "",
      notes: "",
      status: "OPEN",
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
      description: "",
    });
    setScheduleCall(false);
    setScheduledCallData({
      callDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      callTime: "10:00",
      callType: "Outgoing",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (lead: any) => {
    setSelectedLead(lead);
    setFormData({
      customerId: lead.customerId || "",
      productId: lead.productId || "",
      source: lead.source || "OTHER",
      assignedToId: lead.assignedToId || "",
      notes: lead.notes || "",
      status: lead.status || "OPEN",
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
    });
    setScheduleCall(false);
    setScheduledCallData({
      callDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      callTime: "10:00",
      callType: "Outgoing",
    });
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

  const handleCustomerSelect = async (id: number) => {
    try {
      const details = await leadsService.getCustomerDetails(id);
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
      }));
    } catch (err) {
      console.error("Error auto-fetching customer data", err);
    }
  };

  const handleProductSelect = async (id: number) => {
    try {
      const details = await leadsService.getProductDetails(id);
      setFormData(prev => ({
        ...prev,
        productId: id,
        productName: details.name || "",
        productCode: details.sku || details.productCode || "",
        category: details.category || "General",
        brand: details.brand || "",
        unit: details.unit || "",
        price: details.price ? parseFloat(details.price) : 0,
        tax: details.tax ? parseFloat(details.tax) : 0,
        stockQuantity: details.stockQuantity ? parseInt(details.stockQuantity) : 0,
        description: details.description || "",
      }));
    } catch (err) {
      console.error("Error auto-fetching product data", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...formData,
        customerId: formData.customerId ? Number(formData.customerId) : undefined,
        productId: formData.productId ? Number(formData.productId) : undefined,
        assignedToId: formData.assignedToId ? Number(formData.assignedToId) : undefined,
        price: formData.price ? parseFloat(formData.price as any) : 0,
        tax: formData.tax ? parseFloat(formData.tax as any) : 0,
        stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity as any) : 0,
      };

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
      render: (value: string, row: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-indigo-900">{value || "No Product"}</span>
          {row.productCode && <span className="text-[10px] text-slate-400 font-mono">{row.productCode}</span>}
        </div>
      )
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
          <Button onClick={handleAddNew} variant="primary" className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100/50 h-11 px-6 rounded-xl transition-all active:scale-95 flex items-center font-bold">
            <Plus className="w-5 h-5 mr-2" />
            Create New Lead
          </Button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Enquiries', value: dashboardStats.totalLeads, color: 'text-indigo-600 border-indigo-100', icon: Database, bg: 'bg-indigo-50/50' },
          { label: 'Active Pipeline', value: dashboardStats.inProgressLeads, color: 'text-orange-600 border-orange-100', icon: Clock, bg: 'bg-orange-50/50' },
          { label: 'Won / Closed', value: dashboardStats.wonLeads, color: 'text-emerald-600 border-emerald-100', icon: CheckCircle2, bg: 'bg-emerald-50/50' },
          { label: 'Today Follow-ups', value: dashboardStats.todayFollowups, color: 'text-rose-600 border-rose-100', icon: Phone, bg: 'bg-rose-50/50' },
          { label: 'Sales Converted', value: dashboardStats.convertedSales, color: 'text-blue-600 border-blue-100', icon: Landmark, bg: 'bg-blue-50/50' },
        ].map((stat, idx) => (
          <Card key={idx} className="border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] bg-white rounded-2xl overflow-hidden hover:shadow-md transition-all">
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
        ))}
      </div>

      {/* Main Leads Table */}
      <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden bg-white">
        <CardHeader className="px-8 py-5 border-b border-slate-100/80 bg-slate-50/20 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-800">All Registered Leads</CardTitle>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
            Realtime DB Status
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={leadsList}
            onEdit={handleEdit}
            onView={handleView}
            searchPlaceholder="Search leads by customer, product, or representative..."
          />
        </CardContent>
      </Card>

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
                <Select
                  label="Customer Name"
                  required
                  value={formData.customerId?.toString() || ""}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    if (id) {
                      handleCustomerSelect(id);
                    } else {
                      setFormData({ ...formData, customerId: "", customerName: "", email: "", mobileNumber: "", address: "" });
                    }
                  }}
                  options={customers.map(c => ({ value: c.id.toString(), label: c.name }))}
                  placeholder="Select Customer..."
                />
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

              {/* Product Autofilled Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Product Name"
                  required
                  value={formData.productId?.toString() || ""}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    if (id) {
                      handleProductSelect(id);
                    } else {
                      setFormData({ ...formData, productId: "", productName: "", productCode: "", price: 0, stockQuantity: 0 });
                    }
                  }}
                  options={products.map(p => ({ value: p.id.toString(), label: p.name }))}
                  placeholder="Select Product..."
                />
                {productConfig && productConfig.length > 0 ? (
                  productConfig.map((field: any) => {
                    if (field.key === 'name' || field.key === 'productName') return null;
                    
                    const commonProps = {
                      key: field.key,
                      label: field.label,
                      required: field.validationRules?.required,
                      value: formData.productData?.[field.key] || formData[field.key as keyof typeof formData] || "",
                      onChange: (e: any) => {
                        const val = field.dataType === 'checkbox' ? e.target.checked : e.target.value;
                        setFormData({ 
                          ...formData, 
                          productData: { ...(formData.productData || {}), [field.key]: val },
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

                {leadConfig && leadConfig.length > 0 ? (
                  leadConfig.map((field: any) => {
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
                  <span className="text-slate-400 block">Product Interest</span>
                  <span className="font-bold text-indigo-900">{selectedLead?.productName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Assigned Staff</span>
                  <span className="font-semibold text-slate-800">{selectedLead?.assignedTo ? `${selectedLead.assignedTo.firstName} ${selectedLead.assignedTo.lastName}` : 'Unassigned'}</span>
                </div>
              </div>
            </div>

            {/* Log Call/Followup Section */}
            <form onSubmit={handleLogFollowup} className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-600" />
                Log Call / Reschedule
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="Call Type"
                  value={followupForm.callType}
                  onChange={(e) => setFollowupForm({ ...followupForm, callType: e.target.value })}
                  options={[
                    { value: "Incoming", label: "Incoming" },
                    { value: "Outgoing", label: "Outgoing" },
                    { value: "Meeting", label: "Meeting" },
                    { value: "Demo", label: "Demo" },
                  ]}
                  className="rounded-xl"
                />

                <Input
                  label="Call Date"
                  type="date"
                  value={followupForm.callDate}
                  onChange={(e) => setFollowupForm({ ...followupForm, callDate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Call Time"
                  type="time"
                  value={followupForm.callTime}
                  onChange={(e) => setFollowupForm({ ...followupForm, callTime: e.target.value })}
                />

                <Input
                  label="Next Follow-up"
                  type="date"
                  placeholder="Reschedule date"
                  value={followupForm.nextFollowupDate}
                  onChange={(e) => setFollowupForm({ ...followupForm, nextFollowupDate: e.target.value })}
                />
              </div>

              <TextArea
                label="Conversation Summary *"
                required
                value={followupForm.conversation}
                onChange={(e) => setFollowupForm({ ...followupForm, conversation: e.target.value })}
                placeholder="Log key points, pricing discussed, questions asked..."
                className="h-16"
              />

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 flex items-center justify-center font-bold text-xs">
                Log Followup & Reschedule
              </Button>
            </form>
          </div>

          {/* Right Column: Timelines */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Conversation Log & History timeline */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                Lead History & Call Reschedule Timeline
              </h3>

              <div className="relative border-l border-slate-200 pl-5 space-y-6 max-h-96 overflow-y-auto pr-2">
                {selectedLead?.history && selectedLead.history.map((hist: any, index: number) => (
                  <div key={index} className="relative group">
                    <span className="absolute -left-[27px] top-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200/50 w-3 h-3 rounded-full flex items-center justify-center group-hover:scale-125 transition-transform" />
                    
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">{hist.changedBy ? `${hist.changedBy.firstName} ${hist.changedBy.lastName}` : 'System'}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-semibold uppercase">Status Transition</span>
                        </div>
                        <span className="text-slate-400 font-medium">{new Date(hist.timestamp).toLocaleDateString()} {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      <div className="flex gap-2 items-center mb-2">
                        <Badge variant="ghost" className="text-[9px] border border-slate-200">{hist.oldStatus}</Badge>
                        <span className="text-slate-400 text-xs">→</span>
                        <Badge variant="info" className="text-[9px] uppercase">{hist.newStatus}</Badge>
                      </div>

                      {hist.remarks && (
                        <p className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-lg border border-slate-100 font-medium italic mt-1.5 leading-relaxed">
                          "{hist.remarks}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}

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
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                <button onClick={() => removeSchemaField(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
