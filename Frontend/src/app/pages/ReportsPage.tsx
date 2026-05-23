import { useState } from "react";
import { Download, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Input";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const salesReportData = [
  { month: "Jan", sales: 45000, target: 50000 },
  { month: "Feb", sales: 52000, target: 50000 },
  { month: "Mar", sales: 48000, target: 55000 },
  { month: "Apr", sales: 61000, target: 55000 },
];

const regionalData = [
  { name: "North", value: 35 },
  { name: "South", value: 28 },
  { name: "East", value: 20 },
  { name: "West", value: 17 },
];

const productPerformance = [
  { product: "Product A", sales: 125000, units: 450 },
  { product: "Product B", sales: 98000, units: 380 },
  { product: "Product C", sales: 112000, units: 420 },
  { product: "Product D", sales: 87000, units: 320 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"sales" | "product" | "ads" | "visits" | "calls">("sales");
  const [dateRange, setDateRange] = useState("last-30-days");
  const [region, setRegion] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" className="flex-1 sm:flex-initial justify-center">
            <Calendar className="w-4 h-4 mr-2" />
            Date Range
          </Button>
          <Button variant="primary" className="flex-1 sm:flex-initial justify-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { value: "last-7-days", label: "Last 7 Days" },
                { value: "last-30-days", label: "Last 30 Days" },
                { value: "last-90-days", label: "Last 90 Days" },
                { value: "this-year", label: "This Year" },
                { value: "custom", label: "Custom Range" },
              ]}
            />
            <Select
              label="Region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              options={[
                { value: "all", label: "All Regions" },
                { value: "north", label: "North" },
                { value: "south", label: "South" },
                { value: "east", label: "East" },
                { value: "west", label: "West" },
                { value: "central", label: "Central" },
              ]}
            />
            <Select
              label="Product"
              options={[
                { value: "all", label: "All Products" },
                { value: "product-a", label: "Product A" },
                { value: "product-b", label: "Product B" },
                { value: "product-c", label: "Product C" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {[
          { id: "sales", label: "Sales" },
          { id: "product", label: "Product" },
          { id: "ads", label: "Ads" },
          { id: "visits", label: "Visits" },
          { id: "calls", label: "Calls" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sales Tab */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance vs Target</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesReportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#3b82f6" name="Actual Sales" />
                  <Bar dataKey="target" fill="#10b981" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionalData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {regionalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg. Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {productPerformance.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{product.product}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${product.sales.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.units}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${(product.sales / product.units).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Other tabs would show different charts and data */}
      {activeTab !== "sales" && (
        <Card>
          <CardContent className="py-12 text-center text-gray-600">
            <p className="text-lg">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} reports and analytics would be displayed here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
