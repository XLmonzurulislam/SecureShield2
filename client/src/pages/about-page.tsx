
import { SiteHeader } from "@/components/layouts/site-header";
import { SiteFooter } from "@/components/layouts/site-footer";
import { Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About Us</h1>
          <div className="flex items-center justify-center mb-8">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <p className="text-lg mb-6">
            We are a leading cybersecurity company dedicated to protecting businesses and organizations from digital threats. Our team of experts brings years of experience in vulnerability assessment, penetration testing, and security consulting.
          </p>
          <p className="text-lg mb-6">
            Our mission is to make the digital world safer through innovative security solutions and expert guidance. We work closely with our clients to understand their unique security challenges and deliver tailored solutions that meet their needs.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
