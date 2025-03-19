import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SiteHeader } from "@/components/layouts/site-header";
import { SiteFooter } from "@/components/layouts/site-footer";
import { OtpVerificationForm } from "@/components/otp-verification-form";
import { PhoneInput } from "@/components/phone-input";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Mail, User, Phone } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [location, navigate] = useLocation();
  const { user, isVerified, loginMutation, registerMutation, requestOtpMutation } = useAuth();
  
  // Form states
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [registerValues, setRegisterValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  
  const [verificationNeeded, setVerificationNeeded] = useState(false);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (!isVerified) {
        setVerificationNeeded(true);
      } else {
        navigate(user.role === "admin" ? "/admin" : "/dashboard");
      }
    }
  }, [user, isVerified, navigate]);
  
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginValues);
  };
  
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerValues.password !== registerValues.confirmPassword) {
      return; // Validation is handled by the form
    }
    
    registerMutation.mutate(registerValues);
  };
  
  const handleOtpSuccess = () => {
    navigate(user?.role === "admin" ? "/admin" : "/dashboard");
  };
  
  // If user is logged in but not verified, show verification form
  if (user && verificationNeeded) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <SiteHeader />
        <div className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <OtpVerificationForm 
              phone={user.phone} 
              onSuccess={handleOtpSuccess} 
            />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SiteHeader />
      
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            {/* Left Section: Authentication Forms */}
            <div className="md:w-1/2 p-8">
              <div className="mb-6 text-center md:text-left">
                <div className="flex justify-center md:justify-start items-center mb-2">
                  <h1 className="text-2xl font-bold text-primary">CyberShield</h1>
                  <Shield className="ml-2 h-6 w-6 text-orange-500 fill-orange-500" />
                </div>
                <p className="text-gray-600">Secure your digital assets with our cybersecurity services.</p>
              </div>
              
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="loginEmail">Email or Phone</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input 
                          id="loginEmail" 
                          type="text" 
                          className="pl-10" 
                          placeholder="email@example.com or +1234567890"
                          value={loginValues.email}
                          onChange={(e) => setLoginValues({...loginValues, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="loginPassword">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input 
                          id="loginPassword" 
                          type="password" 
                          className="pl-10" 
                          placeholder="••••••••"
                          value={loginValues.password}
                          onChange={(e) => setLoginValues({...loginValues, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="rememberMe"
                          name="rememberMe"
                          type="checkbox"
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                          Remember me
                        </label>
                      </div>
                      <a href="#forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </a>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                  
                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Don't have an account?{" "}
                      <Button 
                        variant="link" 
                        className="text-primary p-0"
                        onClick={() => setActiveTab("register")}
                      >
                        Register
                      </Button>
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input 
                          id="name" 
                          type="text" 
                          className="pl-10" 
                          placeholder="John Doe"
                          value={registerValues.name}
                          onChange={(e) => setRegisterValues({...registerValues, name: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input 
                          id="email" 
                          type="email" 
                          className="pl-10" 
                          placeholder="email@example.com"
                          value={registerValues.email}
                          onChange={(e) => setRegisterValues({...registerValues, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input 
                          id="phone" 
                          type="tel" 
                          className="pl-10" 
                          placeholder="+1 (555) 123-4567"
                          value={registerValues.phone}
                          onChange={(e) => setRegisterValues({...registerValues, phone: e.target.value})}
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input 
                          id="password" 
                          type="password" 
                          className="pl-10" 
                          placeholder="••••••••"
                          value={registerValues.password}
                          onChange={(e) => setRegisterValues({...registerValues, password: e.target.value})}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          className="pl-10" 
                          placeholder="••••••••"
                          value={registerValues.confirmPassword}
                          onChange={(e) => setRegisterValues({...registerValues, confirmPassword: e.target.value})}
                          required
                          minLength={6}
                        />
                      </div>
                      {registerValues.password !== registerValues.confirmPassword && 
                      registerValues.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="termsAccept"
                        name="termsAccept"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        required
                      />
                      <label htmlFor="termsAccept" className="ml-2 block text-sm text-gray-700">
                        I accept the <a href="#terms" className="text-primary hover:underline">Terms of Service</a> and <a href="#privacy" className="text-primary hover:underline">Privacy Policy</a>
                      </label>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending || registerValues.password !== registerValues.confirmPassword}
                    >
                      {registerMutation.isPending ? "Registering..." : "Register"}
                    </Button>
                  </form>
                  
                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Already have an account?{" "}
                      <Button 
                        variant="link" 
                        className="text-primary p-0"
                        onClick={() => setActiveTab("login")}
                      >
                        Login
                      </Button>
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right Section: Hero/Info */}
            <div className="md:w-1/2 bg-primary p-8 text-white hidden md:block">
              <div className="h-full flex flex-col justify-center">
                <h2 className="text-3xl font-bold mb-4">Protect Your Digital Assets</h2>
                <p className="mb-6">Join thousands of businesses that trust CyberShield for their cybersecurity needs. Our comprehensive solutions protect your data, systems, and networks from evolving threats.</p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary-light p-2 rounded-full mr-3">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Enterprise-Grade Security</h3>
                      <p className="text-sm text-gray-200">Advanced protection systems used by leading organizations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary-light p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Immediate Response</h3>
                      <p className="text-sm text-gray-200">24/7 monitoring and rapid incident response team</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-primary-light p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Certified Experts</h3>
                      <p className="text-sm text-gray-200">Team of professionals with top industry certifications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <SiteFooter />
    </div>
  );
}
