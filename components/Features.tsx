import { Truck, Shield, Sparkles, HeadphonesIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function Features() {
  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders above ₹2,999"
    },
    {
      icon: Shield,
      title: "100% Authentic",
      description: "Certified genuine sarees"
    },
    {
      icon: Sparkles,
      title: "Premium Quality",
      description: "Handpicked collections"
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      description: "Dedicated customer care"
    }
  ];

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-md transition-shadow bg-card">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
