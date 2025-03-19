import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RealtimeStatus } from "@/components/realtime-status";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, logoutMutation } = useAuth();
  const [location] = useLocation();

  const navigationItems = [
    { title: "Home", href: "/" },
    { title: "Services", href: "/services" },
    { title: "Blog", href: "/blog" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-white text-2xl font-bold">CyberShield</span>
            <Shield className="ml-2 h-6 w-6 text-orange-500 fill-orange-500" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link 
                key={item.title}
                href={item.href}
                className={`text-white hover:text-orange-500 transition-colors ${
                  isActive(item.href) ? 'text-orange-500' : ''
                }`}
              >
                {item.title}
              </Link>
            ))}

            {user ? (
              <>
                {/* Realtime status indicators */}
                <RealtimeStatus />

                <Link href={isAdmin ? "/admin" : "/dashboard"}>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                    {isAdmin ? "Admin Panel" : "Dashboard"}
                  </Button>
                </Link>
                <Button 
                  variant="default" 
                  className="bg-orange-500 text-white hover:bg-orange-600"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-orange-500 text-white hover:bg-orange-600">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-white"
            aria-label="Toggle navigation menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary-light px-4 py-2">
          <nav className="flex flex-col space-y-3 pb-3">
            {navigationItems.map((item) => (
              <Link 
                key={item.title}
                href={item.href}
                className={`text-white hover:text-orange-500 transition-colors ${
                  isActive(item.href) ? 'text-orange-500' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}

            {user ? (
              <>
                {/* Realtime status in mobile */}
                <div className="flex justify-center mb-2">
                  <RealtimeStatus />
                </div>

                <Link 
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="bg-transparent border border-white text-white hover:bg-white hover:text-primary px-4 py-2 rounded transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {isAdmin ? "Admin Panel" : "Dashboard"}
                </Link>
                <button 
                  onClick={() => {
                    logoutMutation.mutate();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={logoutMutation.isPending}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors text-center w-full"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth"
                  className="bg-transparent border border-white text-white hover:bg-white hover:text-primary px-4 py-2 rounded transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/auth"
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// Placeholder page components (replace with your actual page content)
export function ServicesPage() {
  return <h1>Services</h1>;
}

export function BlogPage() {
  return <h1>Blog</h1>;
}

export function AboutPage() {
  return <h1>About</h1>;
}

export function ContactPage() {
  return <h1>Contact</h1>;
}