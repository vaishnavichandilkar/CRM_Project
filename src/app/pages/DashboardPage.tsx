import { TrendingUp, Phone, Calendar, DollarSign, Percent, Truck, Users, Award } from "lucide-react";
import { KPICard } from "../components/ui/KPICard";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const regionData = [
  { name: "North", leads: 45, orders: 32 },
  { name: "South", leads: 62, orders: 48 },
  { name: "East", leads: 38, orders: 25 },
  { name: "West", leads: 55, orders: 41 },
  { name: "Central", leads: 42, orders: 30 },
];

const adsPerformanceData = [
  { month: "Jan", metaAds: 120, googleAds: 80, referrals: 45 },
  { month: "Feb", metaAds: 145, googleAds: 95, referrals: 52 },
  { month: "Mar", metaAds: 165, googleAds: 110, referrals: 58 },
  { month: "Apr", metaAds: 180, googleAds: 125, referrals: 65 },
];

const dealerPerformance = [
  { name: "ABC Distributors", sales: 125000, orders: 45, region: "North" },
  { name: "XYZ Traders", sales: 98000, orders: 38, region: "South" },
  { name: "Global Dealers", sales: 112000, orders: 42, region: "East" },
  { name: "Prime Partners", sales: 87000, orders: 32, region: "West" },
];

const recentActivities = [
  { action: "New lead assigned", user: "John Doe", time: "5 min ago", type: "lead" },
  { action: "Sale completed", user: "Jane Smith", time: "15 min ago", type: "sale" },
  { action: "Visit scheduled", user: "Mike Johnson", time: "1 hour ago", type: "visit" },
  { action: "Follow-up call made", user: "Sarah Wilson", time: "2 hours ago", type: "call" },
  { action: "New customer added", user: "Tom Brown", time: "3 hours ago", type: "customer" },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Today's Hot Leads"
          value="24"
          icon={TrendingUp}
          color="orange"
          trend={{ value: "12%", isPositive: true }}
        />
        <KPICard
          title="Pending Calls"
          value="18"
          icon={Phone}
          color="blue"
        />
        <KPICard
          title="Follow-ups"
          value="32"
          icon={Calendar}
          color="purple"
          trend={{ value: "5%", isPositive: false }}
        />
        <KPICard
          title="Revenue"
          value="$45.2K"
          icon={DollarSign}
          color="green"
          trend={{ value: "18%", isPositive: true }}
        />
        <KPICard
          title="Total Discount"
          value="$2.8K"
          icon={Percent}
          color="red"
        />
        <KPICard
          title="Deliveries"
          value="67"
          icon={Truck}
          color="blue"
          trend={{ value: "8%", isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region-wise Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Region-wise Leads & Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                <Bar dataKey="orders" fill="#10b981" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ads Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Ads Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={adsPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="metaAds" stroke="#3b82f6" name="Meta Ads" />
                <Line type="monotone" dataKey="googleAds" stroke="#ef4444" name="Google Ads" />
                <Line type="monotone" dataKey="referrals" stroke="#10b981" name="Referrals" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dealer Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Dealer Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dealerPerformance.map((dealer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Award className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{dealer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${dealer.sales.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dealer.orders}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dealer.region}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {recentActivities.map((activity, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'lead' ? 'bg-orange-100' :
                      activity.type === 'sale' ? 'bg-green-100' :
                      activity.type === 'visit' ? 'bg-blue-100' :
                      activity.type === 'call' ? 'bg-purple-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'lead' && <Users className="w-4 h-4 text-orange-600" />}
                      {activity.type === 'sale' && <DollarSign className="w-4 h-4 text-green-600" />}
                      {activity.type === 'visit' && <Calendar className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'call' && <Phone className="w-4 h-4 text-purple-600" />}
                      {activity.type === 'customer' && <Users className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                      <div className="text-sm text-gray-600">{activity.user}</div>
                      <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
