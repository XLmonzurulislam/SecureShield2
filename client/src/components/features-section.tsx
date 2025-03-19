import { CheckIcon } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Expert Team",
    description: "Our security professionals hold top industry certifications with years of experience in protecting critical infrastructure."
  },
  {
    id: 2,
    title: "Comprehensive Protection",
    description: "End-to-end security solutions that address all aspects of your digital presence, from networks to applications."
  },
  {
    id: 3,
    title: "Advanced Technology",
    description: "We utilize cutting-edge tools and techniques to stay ahead of emerging threats and vulnerabilities."
  },
  {
    id: 4,
    title: "24/7 Support",
    description: "Round-the-clock monitoring and support to ensure your systems remain protected at all times."
  }
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <img 
              src="https://images.unsplash.com/photo-1535191042502-e6a9a3d407e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=450&q=80" 
              alt="Security Operations Center" 
              className="rounded-lg shadow-xl" 
              width="600" 
              height="450"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Why Choose CyberShield?</h2>
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-start">
                  <div className="bg-primary text-white p-2 rounded mr-4 mt-1">
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
                    <p className="text-neutral-mid">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
