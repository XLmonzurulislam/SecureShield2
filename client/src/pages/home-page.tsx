import { SiteHeader } from "@/components/layouts/site-header";
import { SiteFooter } from "@/components/layouts/site-footer";
import { ServicesGrid } from "@/components/services-grid";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FeaturesSection } from "@/components/features-section";
import { CtaSection } from "@/components/cta-section";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Enterprise-Grade Security For Everyone</h1>
              <p className="text-lg mb-8">Protect your digital assets with our comprehensive cybersecurity solutions. We offer professional services tailored to businesses of all sizes.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                    Get Started
                  </Button>
                </Link>
                <Link href="#services">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                    Our Services
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Cybersecurity Protection" 
                className="rounded-lg shadow-xl" 
                width="600" 
                height="400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Services */}
      <section id="services" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Our Services</h2>
            <p className="text-neutral-mid max-w-2xl mx-auto">Comprehensive cybersecurity solutions to protect your business from evolving threats.</p>
          </div>
          
          <ServicesGrid />
        </div>
      </section>

      {/* Why Choose Us */}
      <FeaturesSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Call to Action */}
      <CtaSection />

      <SiteFooter />
    </div>
  );
}
