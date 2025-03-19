import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { LockKeyhole, Search, Filter, Eye, RefreshCcw, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Order, UpdateOrderStatus } from "@shared/schema";

export default function ManageOrders() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Fetch all orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });
  
  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async (data: UpdateOrderStatus) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/admin/orders/${data.id}/status`, 
        { status: data.status }
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter orders based on search term and status filter
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = searchTerm === "" || 
      order.id.toString().includes(searchTerm) || 
      order.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle order status change
  const handleStatusChange = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: status as "Pending" | "In Progress" | "Completed" });
  };

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
        
        {/* Manage Orders Content */}
        <main className="p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Manage Orders</h1>
            <p className="text-neutral-mid">View and update the status of all customer orders.</p>
          </div>
          
          <Card className="bg-white shadow border border-gray-100">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <CardTitle>All Orders</CardTitle>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search orders..."
                    className="pl-8 pr-4 w-full md:w-auto"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] })}>
                    <RefreshCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredOrders && filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 text-sm">#{order.id}</td>
                          <td className="px-4 py-3 text-sm">{order.userId}</td>
                          <td className="px-4 py-3 text-sm">{order.serviceName}</td>
                          <td className="px-4 py-3 text-sm">
                            {order.description ? (
                              <span className="line-clamp-1">{order.description}</span>
                            ) : (
                              <span className="text-gray-400 italic">No description</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm">{new Date(order.updatedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm">
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                              disabled={updateOrderStatusMutation.isPending}
                            >
                              <SelectTrigger className="h-8 w-[140px]">
                                <SelectValue>
                                  <OrderStatusBadge status={order.status} />
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Button variant="ghost" size="sm" className="h-8">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No orders found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm || statusFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "There are no orders in the system yet"}
                  </p>
                </div>
              )}
              
              {/* Pagination - To be implemented with proper backend pagination */}
              {filteredOrders && filteredOrders.length > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Showing {filteredOrders.length} orders
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled>
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
