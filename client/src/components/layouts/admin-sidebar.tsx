import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LockKeyhole, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings,
  BarChart, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

export function AdminSidebar({ 
  isMobileOpen, 
  closeMobileMenu 
}: { 
  isMobileOpen: boolean; 
  closeMobileMenu: () => void 
}) {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const navItems: NavItem[] = [
    { 
      title: "Dashboard", 
      href: "/admin", 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      title: "Orders", 
      href: "/admin/orders", 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      title: "Users", 
      href: "/admin/users", 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      title: "Analytics", 
      href: "/admin/analytics", 
      icon: <BarChart className="w-5 h-5" /> 
    },
    { 
      title: "Settings", 
      href: "/admin/settings", 
      icon: <Settings className="w-5 h-5" /> 
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-neutral-900 text-white h-screen sticky top-0 hidden md:block">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <span className="text-xl font-bold">Admin Panel</span>
            <LockKeyhole className="ml-2 h-5 w-5" />
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.title}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center px-4 py-2 rounded transition-colors",
                    location === item.href 
                      ? "bg-gray-700 text-white" 
                      : "hover:bg-gray-700 text-white"
                  )}>
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </a>
                </Link>
              </li>
            ))}
            <li className="mt-8">
              <Button 
                variant="ghost" 
                className="flex w-full items-center justify-start px-4 py-2 text-white hover:bg-gray-700"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-2">
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </span>
              </Button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar (overlay) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="w-64 bg-neutral-900 text-white h-screen overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xl font-bold">Admin Panel</span>
                <LockKeyhole className="ml-2 h-5 w-5" />
              </div>
              <button onClick={closeMobileMenu} className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.title}>
                    <Link href={item.href}>
                      <a 
                        className={cn(
                          "flex items-center px-4 py-2 rounded transition-colors",
                          location === item.href 
                            ? "bg-gray-700 text-white" 
                            : "hover:bg-gray-700 text-white"
                        )}
                        onClick={closeMobileMenu}
                      >
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </a>
                    </Link>
                  </li>
                ))}
                <li className="mt-8">
                  <Button 
                    variant="ghost" 
                    className="flex w-full items-center justify-start px-4 py-2 text-white hover:bg-gray-700"
                    onClick={() => {
                      logoutMutation.mutate();
                      closeMobileMenu();
                    }}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="ml-2">
                      {logoutMutation.isPending ? "Logging out..." : "Logout"}
                    </span>
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
