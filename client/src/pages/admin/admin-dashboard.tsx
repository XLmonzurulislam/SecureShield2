import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  DollarSign,
  LockKeyhole,
  ArrowRight,
  Loader2
} from "lucide-react";
import { User, Order } from "@shared/schema";

// Sample chart data - in a real app this would come from API
const chartData = [
  { name: "Jan", orders: 10, value: 5000 },
  { name: "Feb", orders: 15, value: 7500 },
  { name: "Mar", orders: 13, value: 6500 },
  { name: "Apr", orders: 20, value: 10000 },
  { name: "May", orders: 25, value: 12500 },
  { name: "Jun", orders: 22, value: 11000 },
  { name: "Jul", orders: 30, value: 15000 },
];

export default function AdminDashboard() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });
  
  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });
  
  // Calculate stats
  const totalUsers = users?.length || 0;
  const activeOrders = orders?.filter(order => 
    order.status === "In Progress" || order.status === "Pending"
  ).length || 0;
  const completedOrders = orders?.filter(order => 
    order.status === "Completed"
  ).length || 0;
  
  // Simulate total revenue (in a real app this would come from the API)
  const totalRevenue = "$86,420";
  
  // Stats for the admin dashboard
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      change: "+12 new this month",
      icon: <Users className="h-5 w-5" />,
      bgColor: "bg-blue-100",
      textColor: "text-blue-700"
    },
    {
      title: "Active Orders",
      value: activeOrders,
      change: "+8 new this week",
      icon: <FileText className="h-5 w-5" />,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700"
    },
    {
      title: "Completed Orders",
      value: completedOrders,
      change: "+24 this month",
      icon: <CheckCircle className="h-5 w-5" />,
      bgColor: "bg-green-100",
      textColor: "text-green-700"
    },
    {
      title: "Total Revenue",
      value: totalRevenue,
      change: "+12% this quarter",
      icon: <DollarSign className="h-5 w-5" />,
      bgColor: "bg-purple-100",
      textColor: "text-purple-700"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen}
        closeMobileMenu={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className="flex-1">
        {/* Mobile Header */}
        <header className="bg-white shadow md:hidden p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-neutral-dark text-xl font-bold">Admin Panel</span>
              <LockKeyhole className="text-primary ml-2 h-5 w-5" />
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="text-neutral-dark"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* Admin Dashboard Content */}
        <main className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-neutral-mid">Manage users, orders, and services from this control panel.</p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white p-4 rounded-lg shadow border border-gray-100">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-neutral-mid text-sm font-semibold">{stat.title}</h3>
                    <div className={`${stat.bgColor} ${stat.textColor} p-2 rounded-full`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{
                    (usersLoading || ordersLoading) && (stat.title !== "Total Revenue") ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      stat.value
                    )
                  }</p>
                  <p className="text-xs text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Revenue Chart */}
          <Card className="bg-white rounded-lg shadow border border-gray-100 mb-8">
            <div className="border-b border-gray-100 p-4 md:p-6 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Revenue Overview</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  This Month
                </Button>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </div>
            <CardContent className="p-4 md:p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#0f2c5c" fill="#1a4585" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Orders */}
          <Card className="bg-white rounded-lg shadow border border-gray-100 mb-8">
            <div className="border-b border-gray-100 p-4 md:p-6 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Button variant="outline" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </Button>
            </div>
            <CardContent className="p-4 md:p-6">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 5).map((order) => {
                        // Find the user for this order
                        const orderUser = users?.find(user => user.id === order.userId);
                        
                        return (
                          <tr key={order.id}>
                            <td className="px-4 py-3 text-sm">#{order.id}</td>
                            <td className="px-4 py-3 text-sm">{orderUser?.name || 'Unknown User'}</td>
                            <td className="px-4 py-3 text-sm">{order.serviceName}</td>
                            <td className="px-4 py-3 text-sm">{new Date(order.createdAt).toISOString().split('T')[0]}</td>
                            <td className="px-4 py-3 text-sm">
                              <select 
                                className="text-sm border border-gray-300 rounded py-1 px-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                defaultValue={order.status}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <Button variant="link" size="sm" className="text-teal-600 hover:text-teal-800 p-0 h-auto mr-2">
                                Edit
                              </Button>
                              <Button variant="link" size="sm" className="text-primary hover:text-primary-dark p-0 h-auto">
                                View
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders available.</p>
                </div>
              )}
              
              {orders && orders.length > 0 && (
                <div className="mt-4 text-center">
                  <Link href="/admin/orders" className="text-teal-600 hover:underline inline-flex items-center">
                    View all orders <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* User Management Preview */}
          <Card className="bg-white rounded-lg shadow border border-gray-100">
            <div className="border-b border-gray-100 p-4 md:p-6 flex justify-between items-center">
              <h2 className="text-lg font-semibold">User Management</h2>
              <div className="flex space-x-2">
                <div className="relative hidden md:block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="pl-10 pr-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <Button>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add User
                </Button>
              </div>
            </div>
            <CardContent className="p-4 md:p-6">
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : users && users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.slice(0, 3).map((user) => (
                        <tr key={user.id}>
                          <td className="px-4 py-3 text-sm">{user.id}</td>
                          <td className="px-4 py-3 text-sm">{user.name}</td>
                          <td className="px-4 py-3 text-sm">{user.email}</td>
                          <td className="px-4 py-3 text-sm">{user.phone}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.verified ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button variant="link" size="sm" className="text-teal-600 hover:text-teal-800 p-0 h-auto mr-2">
                              Edit
                            </Button>
                            <Button variant="link" size="sm" className="text-red-500 hover:text-red-700 p-0 h-auto mr-2">
                              Delete
                            </Button>
                            <Button variant="link" size="sm" className="text-primary hover:text-primary-dark p-0 h-auto">
                              Reset
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users available.</p>
                </div>
              )}
              
              {users && users.length > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Showing 1 to {Math.min(3, users.length)} of {users.length} users
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
