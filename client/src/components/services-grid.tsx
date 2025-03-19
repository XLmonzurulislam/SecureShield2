import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, 
  ShieldCheck, 
  BugOff, 
  Code, 
  Lock, 
  UserCheck, 
  ArrowRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Service = {
  id: number;
  name: string;
  description: string;
  icon: string;
  price: number;
};

// Map icon names to components
const iconMap: Record<string, React.ReactNode> = {
  "search": <Search className="text-xl" />,
  "shield-alt": <ShieldCheck className="text-xl" />,
  "virus-slash": <BugOff className="text-xl" />,
  "laptop-code": <Code className="text-xl" />,
  "lock": <Lock className="text-xl" />,
  "user-shield": <UserCheck className="text-xl" />,
};

export function ServicesGrid() {
  const { data: services, isLoading, error } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gray-200 animate-pulse rounded-full mb-4"></div>
              <div className="h-6 bg-gray-200 animate-pulse rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded mb-1 w-full"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded mb-1 w-full"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded mb-4 w-2/3"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading services: {error.message}</p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No services available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service) => (
        <Card key={service.id} className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-white mb-4">
              {iconMap[service.icon] || <ShieldCheck className="text-xl" />}
            </div>
            <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
            <p className="text-neutral-mid mb-4">{service.description}</p>
            <Link href="/place-order" className="text-teal-600 font-semibold hover:text-teal-800 transition-colors flex items-center">
              Learn more <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
