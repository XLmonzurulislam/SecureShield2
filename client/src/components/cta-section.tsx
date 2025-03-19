import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function CtaSection() {
  const { user } = useAuth();
  
  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Business?</h2>
        <p className="max-w-2xl mx-auto mb-8 text-lg">
          Take the first step towards comprehensive cybersecurity protection. 
          {user ? "Order a service today and strengthen your defenses." : "Register today and get a free initial consultation."}
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {user ? (
            <>
              <Link href="/place-order">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Order Now
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Go to Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Register Now
                </Button>
              </Link>
              <Link href="/#contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Contact Sales
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
