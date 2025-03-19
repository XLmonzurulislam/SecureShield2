import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "CyberShield's penetration testing uncovered critical vulnerabilities we had no idea existed. Their remediation guidance was clear and effective.",
    author: "Michael Roberts",
    role: "CTO, TechFirm Inc.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  },
  {
    id: 2,
    content: "After suffering a ransomware attack, CyberShield not only helped us recover but implemented robust protections that have prevented any further incidents.",
    author: "Sarah Johnson",
    role: "Operations Director, Retail Chain",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5
  },
  {
    id: 3,
    content: "The security training provided to our team was exceptional. Our employees are now much more aware of threats and follow security protocols diligently.",
    author: "David Thompson",
    role: "HR Manager, Financial Services",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    rating: 4.5
  }
];

export function TestimonialsSection() {
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center mb-4 text-orange-500">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`star-${i}`} className="fill-current h-5 w-5" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <StarIcon className="text-gray-300 fill-current h-5 w-5" />
            <div className="absolute top-0 overflow-hidden w-1/2">
              <StarIcon className="fill-current text-orange-500 h-5 w-5" />
            </div>
          </div>
        )}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <StarIcon key={`empty-star-${i}`} className="text-gray-300 fill-current h-5 w-5" />
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">What Our Clients Say</h2>
          <p className="text-neutral-mid max-w-2xl mx-auto">Hear from organizations we've helped secure against cyber threats.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-neutral-light shadow border border-gray-100">
              <CardContent className="p-6">
                {renderRating(testimonial.rating)}
                <p className="mb-4 text-neutral-dark italic">{testimonial.content}</p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="w-12 h-12 rounded-full mr-4" 
                    width="48" 
                    height="48"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.author}</h4>
                    <p className="text-sm text-neutral-mid">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
