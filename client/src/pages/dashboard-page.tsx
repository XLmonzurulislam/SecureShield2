import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  ClipboardList,
  ShieldCheck,
  Bug,
  CheckCircle
} from "lucide-react";
import { Order } from "@shared/schema";

export default function DashboardPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user
  });

  // Calculate dashboard statistics
  const activeOrders = orders?.filter(order => 
    order.status === "In Progress" || order.status === "Pending"
  ).length || 0;
  
  const completedOrders = orders?.filter(order => 
    order.status === "Completed"
  ).length || 0;

  // Dashboard quick stats data
  const stats = [
    {
      title: "Active Orders",
      value: activeOrders,
      change: "+1 new this month",
      icon: <ClipboardList className="h-5 w-5" />,
      bgColor: "bg-blue-100",
      textColor: "text-blue-700"
    },
    {
      title: "Security Score",
      value: "85%",
      change: "+5% improvement",
      icon: <ShieldCheck className="h-5 w-5" />,
      bgColor: "bg-green-100",
      textColor: "text-green-700"
    },
    {
      title: "Vulnerabilities",
      value: "3",
      change: "2 resolved",
      icon: <Bug className="h-5 w-5" />,
      bgColor: "bg-red-100",
      textColor: "text-red-700"
    },
    {
      title: "Completed Services",
      value: completedOrders,
      change: "+3 this year",
      icon: <CheckCircle className="h-5 w-5" />,
      bgColor: "bg-purple-100",
      textColor: "text-purple-700"
    }
  ];

  // Mock services (in a real app, these would come from the API)
  const popularServices = [
    {
      id: 1,
      name: "Penetration Testing",
      description: "Identify vulnerabilities before hackers do.",
      icon: <Search className="text-primary text-xl" />
    },
    {
      id: 2,
      name: "Vulnerability Assessment",
      description: "Comprehensive scanning of your infrastructure.",
      icon: <ShieldCheck className="text-primary text-xl" />
    },
    {
      id: 3,
      name: "Security Training",
      description: "Train your team on security best practices.",
      icon: <UserCheck className="text-primary text-xl" />
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <DashboardSidebar 
        isMobileOpen={isMobileSidebarOpen}
        closeMobileMenu={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className="flex-1">
        {/* Mobile Header */}
        <header className="bg-white shadow md:hidden p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-primary text-xl font-bold">CyberShield</span>
              <Shield className="text-orange-500 ml-2 h-5 w-5" />
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="text-primary"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-neutral-mid">Here's an overview of your security services and status.</p>
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
                  <p className="text-2xl font-bold">{stat.value}</p>
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
          
          {/* Recent Orders */}
          <Card className="bg-white rounded-lg shadow border border-gray-100 mb-8">
            <div className="border-b border-gray-100 p-4 md:p-6">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
            </div>
            <CardContent className="p-4 md:p-6">
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, 3).map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 text-sm">#{order.id}</td>
                          <td className="px-4 py-3 text-sm">{order.serviceName}</td>
                          <td className="px-4 py-3 text-sm">{new Date(order.createdAt).toISOString().split('T')[0]}</td>
                          <td className="px-4 py-3 text-sm">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Link href={`/orders/${order.id}`} className="text-teal-600 hover:underline">View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You don't have any orders yet.</p>
                  <Link href="/place-order">
                    <Button>Place Your First Order</Button>
                  </Link>
                </div>
              )}
              
              {orders && orders.length > 0 && (
                <div className="mt-4 text-center">
                  <Link href="/orders" className="text-teal-600 hover:underline">View all orders</Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Order a Service */}
          <Card className="bg-white rounded-lg shadow border border-gray-100">
            <div className="border-b border-gray-100 p-4 md:p-6">
              <h2 className="text-lg font-semibold">Order a Service</h2>
            </div>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularServices.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-600 transition-colors cursor-pointer">
                    <div className="mb-2">
                      {service.icon}
                    </div>
                    <h3 className="font-semibold mb-1">{service.name}</h3>
                    <p className="text-sm text-neutral-mid mb-4">{service.description}</p>
                    <Link href="/place-order" className="text-teal-600 font-medium hover:underline flex items-center">
                      Order now <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/place-order" className="text-teal-600 hover:underline">View all services</Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

import { Search, UserCheck, Shield, ArrowRight } from "lucide-react";
