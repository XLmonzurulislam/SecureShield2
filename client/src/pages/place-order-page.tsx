import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, AlertCircle, CheckCircle, Info, Loader2 } from "lucide-react";
import { OtpVerificationForm } from "@/components/otp-verification-form";
import { InsertOrder } from "@shared/schema";

// Type for service data
type Service = {
  id: number;
  name: string;
  description: string;
  icon: string;
  price: number;
};

export default function PlaceOrderPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [, navigate] = useLocation();
  
  const { user, isVerified, requestOtpMutation } = useAuth();

  // Fetch available services
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: !!user
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully",
        description: "You can track the progress in your orders page.",
        variant: "default",
      });
      navigate("/orders");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle verification success
  const handleVerificationSuccess = () => {
    // Refresh user data to update verification status
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  };

  // Handle order submission
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) {
      toast({
        title: "Service required",
        description: "Please select a service to continue.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      serviceName: selectedService,
      description: description,
      userId: user!.id
    });
  };

  // Handle request for phone verification
  const handleRequestVerification = () => {
    if (!user) return;
    
    requestOtpMutation.mutate(
      { phone: user.phone },
      {
        onSuccess: () => {
          toast({
            title: "Verification code sent",
            description: "Please check your phone for the verification code.",
          });
        }
      }
    );
  };

  // If user is not verified, show verification form
  if (user && !isVerified) {
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
          
          <main className="p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-amber-50 border-amber-200 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-amber-800">Phone verification required</h3>
                      <p className="text-sm text-amber-700">
                        You need to verify your phone number before placing an order.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <OtpVerificationForm 
                phone={user.phone} 
                onSuccess={handleVerificationSuccess} 
              />
              
              <div className="text-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={handleRequestVerification}
                  disabled={requestOtpMutation.isPending}
                >
                  {requestOtpMutation.isPending ? "Sending..." : "Resend verification code"}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
        
        {/* Place Order Content */}
        <main className="p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Place a New Order</h1>
            <p className="text-neutral-mid">Select a service and provide details for your order.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Service Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select a Service</CardTitle>
                  <CardDescription>Choose the cybersecurity service you need</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitOrder}>
                    <div className="space-y-4">
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="service">Service Type</Label>
                        <Select 
                          value={selectedService} 
                          onValueChange={setSelectedService}
                        >
                          <SelectTrigger id="service">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {servicesLoading ? (
                              <div className="flex justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : services && services.length > 0 ? (
                              services.map((service) => (
                                <SelectItem key={service.id} value={service.name}>
                                  {service.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-sm text-gray-500">
                                No services available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your requirements in detail..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={createOrderMutation.isPending || !selectedService}
                      >
                        {createOrderMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Selected Service</h3>
                      <p className="font-medium">
                        {selectedService || <span className="text-gray-400 italic">No service selected</span>}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p>
                        {description || <span className="text-gray-400 italic">No description provided</span>}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex flex-col items-start p-4">
                  <div className="mb-2 flex items-start">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                    <p className="text-sm text-gray-600">
                      After placing your order, our team will review your requirements and contact you for any additional information.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
