import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { DashboardSidebar } from "@/components/layouts/dashboard-sidebar";
import { OtpVerificationForm } from "@/components/otp-verification-form";
import { PhoneInput } from "@/components/phone-input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Check, AlertTriangle, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, isVerified, requestOtpMutation } = useAuth();
  
  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string }) => {
      const res = await apiRequest("PATCH", `/api/user`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
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
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", `/api/user/change-password`, data);
      return await res.json();
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, email, phone });
  };
  
  // Handle password form submission
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };
  
  // Handle verification request
  const handleRequestVerification = () => {
    requestOtpMutation.mutate(
      { phone: user!.phone },
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

  // Handle verification success
  const handleVerificationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    toast({
      title: "Phone verified",
      description: "Your phone number has been verified successfully.",
    });
  };

  if (!user) return null;

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
        
        {/* Profile Content */}
        <main className="p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {/* Phone Verification Status */}
              {!isVerified && (
                <Card className="mb-6 bg-amber-50 border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-amber-800">Phone verification required</h3>
                        <p className="text-sm text-amber-700 mb-3">
                          Your phone number is not verified. Verify your phone to enable all features.
                        </p>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-amber-600 hover:bg-amber-700"
                          onClick={handleRequestVerification}
                          disabled={requestOtpMutation.isPending}
                        >
                          {requestOtpMutation.isPending ? "Sending..." : "Verify Phone Number"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {!isVerified && requestOtpMutation.isSuccess && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Phone Verification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OtpVerificationForm 
                      phone={user.phone} 
                      onSuccess={handleVerificationSuccess} 
                    />
                  </CardContent>
                </Card>
              )}
              
              {/* Profile Information */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid gap-4">
                      <div className="grid gap-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      
                      <div className="grid gap-1.5">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                      
                      <div className="grid gap-1.5">
                        <Label htmlFor="phone">Phone Number</Label>
                        <PhoneInput
                          value={phone}
                          onChange={setPhone}
                          placeholder="+1 (555) 123-4567"
                        />
                        {isVerified ? (
                          <div className="flex items-center mt-1 text-sm text-green-600">
                            <Check className="h-3.5 w-3.5 mr-1" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">Not verified</p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="mt-2"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Profile"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange}>
                    <div className="grid gap-4">
                      <div className="grid gap-1.5">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      
                      <div className="grid gap-1.5">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>
                      
                      <div className="grid gap-1.5">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="mt-2"
                        disabled={
                          changePasswordMutation.isPending || 
                          !currentPassword || 
                          !newPassword || 
                          newPassword !== confirmPassword
                        }
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Account Overview */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Account Status</h3>
                      <div className="flex items-center mt-1">
                        <div className={`h-2.5 w-2.5 rounded-full ${isVerified ? 'bg-green-500' : 'bg-amber-500'} mr-2`}></div>
                        <p className="font-medium">{isVerified ? 'Active' : 'Pending Verification'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                      <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                      <p className="font-medium capitalize">{user.role}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Need help? Contact our support team at <a href="mailto:support@cybershield.com" className="text-primary hover:underline">support@cybershield.com</a>
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
