import { useState, useEffect } from "react";
import { Plus, ArrowRight, RefreshCw, Layers, Eye, Edit, Calendar, TrendingUp, DollarSign, History, ShoppingBag, Tag } from "lucide-react";
import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { DataTable } from "../components/ui/DataTable";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal, ModalFooter } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Input";
import { leadsService } from "../services/leadService";
import { salesService } from "../../services/sales.service";

export function SalesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"fresh" | "resale">("fresh");
  const [pipelineFilter, setPipelineFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<"all" | "weekly" | "monthly" | "quarterly">("all");
  const [salesList, setSalesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSaleForView, setSelectedSaleForView] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [funnelStats, setFunnelStats] = useState({ leads: 0, opps: 0 });
  const [formData, setFormData] = useState({
    customer: "",
    product: "",
    qty: "" as string | number,
    amount: "",
    status: "Sale",
  });

  const fetchSales = async () => {
    try {
      setLoading(true);
      const custData = await leadsService.getCustomersDropdown();
      setCustomers(custData);
      const prodData = await leadsService.getProductsDropdown();
      setProducts(prodData);
      
      const leads = await leadsService.getAllLeads();
      setFunnelStats({
        leads: leads.filter((l: any) => l.status === 'OPEN' || l.status === 'Open').length,
        opps: leads.filter((l: any) => l.status === 'IN_PROGRESS' || l.status === 'In Progress' || l.status === 'OPPORTUNITY').length
      });
      const wonLeads = leads.filter((l: any) => l.isConverted === true || l.status === 'WON' || l.status === 'Won' || l.status === 'WON/CLOSED');


      const backendSales = await salesService.getSalesData();
      
      // Calculate frequency per customer using BOTH wonLeads and backendSales
      const customerSalesMap = new Map<string, Date[]>();
      
      wonLeads.forEach((l: any) => {
         const cName = l.customerName || "Unnamed Customer";
         if (!customerSalesMap.has(cName)) customerSalesMap.set(cName, []);
         customerSalesMap.get(cName)!.push(new Date(l.createdAt));
      });
      
      backendSales.forEach((s: any) => {
         const cName = s.customer?.name || "Unnamed Customer";
         if (!customerSalesMap.has(cName)) customerSalesMap.set(cName, []);
         customerSalesMap.get(cName)!.push(new Date(s.createdAt));
      });
      
      const frequencyMap = new Map<string, string>();
      customerSalesMap.forEach((dates, cName) => {
         if (dates.length < 2) {
            frequencyMap.set(cName, "First Time");
         } else {
            dates.sort((a, b) => a.getTime() - b.getTime());
            let totalDiff = 0;
            for (let i = 1; i < dates.length; i++) {
               totalDiff += dates[i].getTime() - dates[i-1].getTime();
            }
            const avgDiffDays = (totalDiff / (dates.length - 1)) / (1000 * 3600 * 24);
            if (avgDiffDays <= 10) frequencyMap.set(cName, "Weekly");
            else if (avgDiffDays <= 45) frequencyMap.set(cName, "Monthly");
            else if (avgDiffDays <= 120) frequencyMap.set(cName, "Quarterly");
            else frequencyMap.set(cName, "Yearly");
         }
      });

      const mapped = wonLeads.map((l: any) => {
        const cName = l.customerName || "Unnamed Customer";
        const purchaseCount = customerSalesMap.get(cName)?.length || 1;
        return {
          id: l.id,
          customer: cName,
          product: l.productName || "Product",
          amount: (l.price || 0) * (l.stockQuantity || 1),
          status: "Sale",
          type: purchaseCount > 1 ? "Resale" : "Fresh",
          date: new Date(l.createdAt).toISOString().split('T')[0],
          resaleCount: purchaseCount > 1 ? purchaseCount : 0,
          frequency: frequencyMap.get(cName) || "First Time",
          lead: l,
        };
      });

      const mappedBackendSales = backendSales.map((s: any) => {
        const cName = s.customer?.name || "Unnamed Customer";
        const purchaseCount = customerSalesMap.get(cName)?.length || 1;
        return {
          id: s.id,
          customer: cName,
          product: s.product?.name || "Product",
          amount: s.amount,
          status: s.status,
          type: purchaseCount > 1 ? "Resale" : "Fresh",
          date: new Date(s.createdAt).toISOString().split('T')[0],
          resaleCount: purchaseCount > 1 ? purchaseCount : 0,
          frequency: frequencyMap.get(cName) || "First Time"
        };
      });

      setSalesList([...mapped, ...mappedBackendSales]);
    } catch (err) {
      console.error("Error loading sales pipeline", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const customerId = customers.find(c => c.name === formData.customer)?.id || 0;
      const productId = products.find(p => p.name === formData.product)?.id || 0;

      if (!customerId || !productId) {
        alert("Please select a valid customer and product.");
        return;
      }

      await salesService.createSale({
        amount: parseFloat(formData.amount) || 0,
        status: formData.status as any,
        customerId,
        productId,
        purchaseCount: activeTab === "resale" ? 2 : 1,
      });

      setIsModalOpen(false);
      setFormData({
        customer: "",
        product: "",
        qty: "",
        amount: "",
        status: "Sale",
      });
      fetchSales();
    } catch (err) {
      console.error("Failed to add sale", err);
    }
  };

  const filteredData = salesList.filter(sale => {
    const tabMatch = activeTab === "fresh" ? sale.type === "Fresh" : sale.type === "Resale";
    if (!tabMatch) return false;
    if (pipelineFilter) {
       if (sale.status !== pipelineFilter) return false;
    }
    
    if (timeFilter !== "all") {
       const saleDate = new Date(sale.date);
       const now = new Date();
       if (timeFilter === "weekly") {
         const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
         if (saleDate < oneWeekAgo) return false;
       } else if (timeFilter === "monthly") {
         const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
         if (saleDate < oneMonthAgo) return false;
       } else if (timeFilter === "quarterly") {
         const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
         if (saleDate < threeMonthsAgo) return false;
       }
    }
    
    return true;
  });

  const columns = [
    { key: "customer", label: "Customer Name", sortable: true, render: (val: string) => <span className="font-semibold text-slate-800">{val}</span> },
    { key: "product", label: "Product Interest", sortable: true, render: (val: string) => <span className="font-semibold text-indigo-950">{val}</span> },
    {
      key: "amount",
      label: "Closed Value",
      sortable: true,
      render: (value: number) => <span className="font-bold text-slate-800">{value.toLocaleString()}</span>,
    },
    {
      key: "status",
      label: "Sales Status",
      sortable: true,
      render: (value: string) => {
        const variant =
          value === "Invoice" ? "success" :
          value === "Sale" ? "info" :
          value === "Opportunity" ? "warning" :
          "default";
        return <Badge variant={variant} className="rounded-lg font-bold tracking-tight text-[10px] uppercase">{value}</Badge>;
      },
    },
    ...(activeTab === "resale" ? [
      {
        key: "resaleCount",
        label: "Purchase History",
        render: (value: number) => <Badge variant="info" className="font-bold">{value}x Purchase</Badge>,
      },
      {
        key: "frequency",
        label: "Frequency",
        render: (value: string) => {
          let color = "text-slate-500 bg-slate-100";
          if (value === "Weekly") color = "text-indigo-600 bg-indigo-50 border-indigo-200";
          else if (value === "Monthly") color = "text-emerald-600 bg-emerald-50 border-emerald-200";
          else if (value === "Quarterly") color = "text-orange-600 bg-orange-50 border-orange-200";
          
          return (
            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${color}`}>
              {value}
            </span>
          );
        }
      }
    ] : []),
    { key: "date", label: "Closed Date", sortable: true },
    {
      key: "actions",
      label: "Actions",
      render: (_, item: any) => (
        <div className="flex gap-2">
          {item.type === "Fresh" ? (
            <>
              <button 
                 onClick={() => { setSelectedSaleForView(item); setIsViewModalOpen(true); }}
                 className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                 title="View Purchase History & Insights"
              >
                 <Eye className="w-4 h-4" />
              </button>
              <button 
                 onClick={() => navigate('/leads', { state: { editLeadId: item.id } })}
                 className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                 title="Edit Lead"
              >
                 <Edit className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                 onClick={() => { setSelectedSaleForView(item); setIsViewModalOpen(true); }}
                 className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                 title="View Purchase History & Insights"
              >
                 <Eye className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">
                Direct Sale
              </span>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales & Revenue Pipeline</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Monitor closed transactions, generated invoices, and customer lifetime value</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button onClick={fetchSales} variant="outline" className="h-11 px-4 rounded-xl flex items-center border-slate-200">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setIsModalOpen(true)} variant="primary" className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100/50 h-11 px-6 rounded-xl flex items-center font-bold w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Sales Order
          </Button>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <Card className="border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <CardHeader className="py-4 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-slate-400" />
            CRM Lead-to-Sale Conversion funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 py-6 bg-slate-50/50 rounded-2xl border border-slate-100">
            <button 
              onClick={() => navigate('/leads', { state: { filter: 'ALL' } })}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform group"
            >
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 group-hover:border-indigo-300 rounded-full flex items-center justify-center mb-1 shadow-sm">
                <span className="text-lg font-extrabold text-indigo-700">{funnelStats.leads}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-indigo-600 uppercase tracking-wider">Leads</span>
            </button>
            <ArrowRight className="w-5 h-5 text-slate-300" />
            <button 
              onClick={() => navigate('/leads', { state: { filter: 'ACTIVE_PIPELINE' } })}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform group"
            >
              <div className="w-14 h-14 bg-orange-50 border border-orange-100 group-hover:border-orange-300 rounded-full flex items-center justify-center mb-1 shadow-sm">
                <span className="text-lg font-extrabold text-orange-700">{funnelStats.opps}</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-orange-600 uppercase tracking-wider">Opp.</span>
            </button>
            <ArrowRight className="w-5 h-5 text-slate-300" />
            <button 
              onClick={() => setPipelineFilter(prev => prev === 'Sale' ? null : 'Sale')}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform group"
            >
              <div className={`w-14 h-14 bg-emerald-50 border ${pipelineFilter === 'Sale' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-emerald-100 group-hover:border-emerald-300'} rounded-full flex items-center justify-center mb-1 shadow-sm transition-all`}>
                <span className="text-lg font-extrabold text-emerald-700">{salesList.filter(s => s.status === 'Sale').length}</span>
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${pipelineFilter === 'Sale' ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'}`}>Orders</span>
            </button>
            <ArrowRight className="w-5 h-5 text-slate-300" />
            <button 
              onClick={() => setPipelineFilter(prev => prev === 'Invoice' ? null : 'Invoice')}
              className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform group"
            >
              <div className={`w-14 h-14 bg-blue-50 border ${pipelineFilter === 'Invoice' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-100 group-hover:border-blue-300'} rounded-full flex items-center justify-center mb-1 shadow-sm transition-all`}>
                <span className="text-lg font-extrabold text-blue-700">{salesList.filter(s => s.status === 'Invoice').length}</span>
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${pipelineFilter === 'Invoice' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>Invoiced</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("fresh")}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === "fresh"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Fresh Customer Conversions
        </button>
        <button
          onClick={() => setActiveTab("resale")}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === "resale"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Resale / Customer Lifetime Value
        </button>
      </div>

      {/* Sales Pipeline List */}
      <Card className="border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden bg-white">
        <CardHeader className="px-8 py-5 border-b border-slate-100/80 bg-slate-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-sm font-bold text-slate-800">
            {activeTab === "fresh" ? "Fresh Sales Pipeline (Won CRM Leads)" : "Loyal / Resale Customer Transactions"}
          </CardTitle>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
            >
              <option value="all">All Time</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="quarterly">This Quarter</option>
            </select>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-full uppercase">
              Active Accounts
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredData}
            searchPlaceholder="Search pipeline..."
          />
        </CardContent>
      </Card>

      {/* Add manually sale modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Sales Record"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Customer Name"
              required
              value={formData.customer}
              onChange={(e) => {
                const newCustomerName = e.target.value;
                const selectedCustomer = customers.find(c => c.name === newCustomerName);
                const isDealer = selectedCustomer?.type?.toLowerCase().includes('dealer') || selectedCustomer?.type?.toLowerCase().includes('wholesale');
                
                let newAmount = formData.amount;
                if (formData.product) {
                   const prod = products.find(p => p.name === formData.product);
                   if (prod) {
                      newAmount = (isDealer && prod.dealerRate ? prod.dealerRate : (prod.customerRate || prod.price || 0)).toString();
                   }
                }
                
                setFormData({ ...formData, customer: newCustomerName, amount: newAmount });
              }}
              options={[
                { value: "", label: "Select Customer..." },
                ...customers.map(c => ({ value: c.name, label: c.name }))
              ]}
            />
            <Select
              label="Product Name"
              required
              value={formData.product}
              onChange={(e) => {
                const selectedProdName = e.target.value;
                const prod = products.find(p => p.name === selectedProdName);
                const selectedCustomer = customers.find(c => c.name === formData.customer);
                const isDealer = selectedCustomer?.type?.toLowerCase().includes('dealer') || selectedCustomer?.type?.toLowerCase().includes('wholesale');
                const price = prod ? (isDealer && prod.dealerRate ? prod.dealerRate : (prod.customerRate || prod.price || 0)) : 0;
                setFormData({ 
                  ...formData, 
                  product: selectedProdName,
                  qty: prod?.quantity || 1,
                  amount: price ? price.toString() : formData.amount
                });
              }}
              options={[
                { value: "", label: "Select Product..." },
                ...products.map(p => ({ value: p.name, label: p.name }))
              ]}
            />
            <Input
              label="Quantity"
              type="text"
              required
              value={formData.qty}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  qty: e.target.value
                });
              }}
            />
            <Input
              label="Deal Value"
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 5000"
            />
            <Select
              label="Pipeline Status"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "Sale", label: "Sale" },
                { value: "Invoice", label: "Invoice" },
              ]}
            />
          </div>

          <ModalFooter className="mt-8 border-t-0 px-0">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Sales Order
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Sales Detail & Customer Insights Modal */}
      {selectedSaleForView && (() => {
        const customerHistory = salesList
          .filter(s => s.customer === selectedSaleForView.customer)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const frequencyCount = customerHistory.length;
        
        let frequencyTier = "New Customer (1st Purchase)";
        if (frequencyCount === 2) {
          frequencyTier = "Repeat Customer (2 Purchases)";
        } else if (frequencyCount >= 3) {
          frequencyTier = `Frequent Purchaser (${frequencyCount} Purchases)`;
        }

        const customerLTV = customerHistory.reduce((sum, s) => sum + s.amount, 0);

        const currentIndex = customerHistory.findIndex(s => s.id === selectedSaleForView.id);
        const previousPurchase = currentIndex !== -1 && currentIndex < customerHistory.length - 1
          ? customerHistory[currentIndex + 1]
          : null;

        const selectedProducts = selectedSaleForView.lead?.productData?.selectedProducts || [];

        return (
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => { setIsViewModalOpen(false); setSelectedSaleForView(null); }}
            title="Sales Record & Customer Insights"
            size="xl"
          >
            <div className="space-y-6">
              
              {/* Profile & Date Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedSaleForView.customer}</h3>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Transaction Date: {selectedSaleForView.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={selectedSaleForView.type === "Fresh" ? "info" : "success"} className="rounded-lg font-bold text-[10px] uppercase">
                    {selectedSaleForView.type} Acquisition
                  </Badge>
                  <Badge variant={selectedSaleForView.status === "Invoice" ? "success" : "info"} className="rounded-lg font-bold text-[10px] uppercase">
                    {selectedSaleForView.status}
                  </Badge>
                </div>
              </div>

              {/* Insights Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-blue-500" />
                    Purchase Frequency
                  </span>
                  <div className="text-xl font-extrabold text-slate-800 mt-1">{frequencyCount}x</div>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-200/50 px-2 py-0.5 rounded mt-1.5 inline-block">
                    {frequencyTier}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    Last Purchase Price
                  </span>
                  <div className="text-xl font-extrabold text-slate-800 mt-1">
                    {previousPurchase ? `${previousPurchase.amount.toLocaleString()}` : "N/A"}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1.5 block">
                    {previousPurchase ? `Ordered on ${previousPurchase.date}` : "First-time Buyer"}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                    Total Value
                  </span>
                  <div className="text-xl font-extrabold text-indigo-900 mt-1">{customerLTV.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1.5 block">
                    Cumulative Billing
                  </span>
                </div>
              </div>

              {/* Quantity Purchased breakdown section */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-slate-400" />
                  Product Quantity & Price Breakdown
                </span>
                
                <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden max-w-full">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200/40">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Product Name</th>
                        <th className="px-4 py-2.5 text-left">SKU</th>
                        <th className="px-4 py-2.5 text-center w-20">Qty</th>
                        <th className="px-4 py-2.5 text-right w-28">Unit Price</th>
                        <th className="px-4 py-2.5 text-right w-24">Discount</th>
                        <th className="px-4 py-2.5 text-right w-32">Total Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {selectedProducts.length > 0 ? (
                        selectedProducts.map((p: any, idx: number) => {
                          const qty = p.qty ?? 1;
                          const price = p.price ?? 0;
                          const discAmt = p.discountAmount ?? 0;
                          const total = p.afterDiscountPrice ?? (price * qty);
                          return (
                            <tr key={p.id || idx} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2.5 text-slate-900 font-semibold">{p.name || selectedSaleForView.product}</td>
                              <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{p.sku || "N/A"}</td>
                              <td className="px-4 py-2.5 text-center font-extrabold text-slate-800 bg-slate-50/50">{qty}</td>
                              <td className="px-4 py-2.5 text-right">{price.toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right text-rose-500 font-semibold">-{discAmt.toLocaleString()}</td>
                              <td className="px-4 py-2.5 text-right font-extrabold text-indigo-900">{total.toLocaleString()}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 text-slate-900 font-semibold">{selectedSaleForView.product}</td>
                          <td className="px-4 py-3.5 font-mono text-[10px] text-slate-400">N/A</td>
                          <td className="px-4 py-3.5 text-center font-extrabold text-slate-800 bg-slate-50/50">1</td>
                          <td className="px-4 py-3.5 text-right">{selectedSaleForView.amount.toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-right text-slate-400">-</td>
                          <td className="px-4 py-3.5 text-right font-extrabold text-indigo-900">{selectedSaleForView.amount.toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Purchase History timeline section */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-slate-400" />
                  Historical Purchase Timeline
                </span>
                
                <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 ml-2">
                  {customerHistory.map((hist: any, index: number) => {
                    const isCurrent = hist.id === selectedSaleForView.id && hist.type === selectedSaleForView.type;
                    return (
                      <div key={hist.id + "-" + index} className="relative">
                        <div className={`absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border-2 bg-white ${isCurrent ? 'border-indigo-600 ring-4 ring-indigo-100' : 'border-slate-300'}`}></div>
                        <div className={`p-3 rounded-lg border ${isCurrent ? 'bg-indigo-50/20 border-indigo-100' : 'bg-white border-slate-100/80'} flex items-center justify-between text-xs`}>
                          <div>
                            <span className="font-semibold text-slate-500 block">{hist.date}</span>
                            <span className="font-bold text-slate-800">{hist.product}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 block">{hist.amount.toLocaleString()}</span>
                            <span className="text-[9px] uppercase font-bold text-slate-400">{hist.type} Order</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <ModalFooter className="border-t border-slate-100 pt-4 mt-6">
                <Button variant="secondary" onClick={() => { setIsViewModalOpen(false); setSelectedSaleForView(null); }}>
                  Close Details
                </Button>
              </ModalFooter>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
