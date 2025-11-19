import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useStore } from "../lib/store";

interface Category {
  id: number;
  name: string;
  image: string;
  count: number;
}

interface CategoriesProps {
  onCategorySelect: (categoryName: string) => void;
  onCategoryPageSelect?: (categoryName: string) => void;
}

export function Categories({ onCategorySelect, onCategoryPageSelect }: CategoriesProps) {
  const { siteSettings } = useStore();
  
  // Get category images from settings or use defaults
  const categoryImagesFromSettings = siteSettings.categoryImages || [
    { name: "Wedding", url: "https://images.unsplash.com/photo-1726981448126-c7fc9237cdb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwc2FyZWUlMjBzaWxrfGVufDF8fHx8MTc2MzM2NDU5Mnww&ixlib=rb-4.1.0&q=80&w=1080" },
    { name: "Ethnic", url: "https://images.unsplash.com/photo-1742287721821-ddf522b3f37b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhuaWMlMjBzaWxrJTIwc2FyZWV8ZW58MXx8fHwxNzYzMzY0NTkyfDA&ixlib=rb-4.1.0&q=80&w=1080" },
    { name: "Casuals", url: "https://images.unsplash.com/photo-1692107271822-50cc09b2bf73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBjb3R0b24lMjBzYXJlZXxlbnwxfHx8fDE3NjMzMTk4NzR8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    { name: "Festival", url: "https://images.unsplash.com/photo-1761125056724-fb6485468a9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZXN0aXZhbCUyMHNhcmVlJTIwdHJhZGl0aW9uYWx8ZW58MXx8fHwxNzYzMzY0NTkzfDA&ixlib=rb-4.1.0&q=80&w=1080" },
    { name: "New Arrivals", url: "https://images.unsplash.com/photo-1756483509177-bbabd67a3234?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNhcmVlJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjMzNjQ1OTN8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    { name: "Celebrity", url: "https://images.unsplash.com/photo-1762068863008-dbeb2e2c6896?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzYXJlZSUyMGJyaWRhbHxlbnwxfHx8fDE3NjMzNjQ1OTN8MA&ixlib=rb-4.1.0&q=80&w=1080" }
  ];

  // Create categories array with images from settings
  const categories: Category[] = [
    {
      id: 1,
      name: "Wedding",
      image: categoryImagesFromSettings.find(c => c.name === "Wedding")?.url || categoryImagesFromSettings[0].url,
      count: 45
    },
    {
      id: 2,
      name: "Ethnic",
      image: categoryImagesFromSettings.find(c => c.name === "Ethnic")?.url || categoryImagesFromSettings[1].url,
      count: 38
    },
    {
      id: 3,
      name: "Casuals",
      image: categoryImagesFromSettings.find(c => c.name === "Casuals")?.url || categoryImagesFromSettings[2].url,
      count: 52
    },
    {
      id: 4,
      name: "Festival",
      image: categoryImagesFromSettings.find(c => c.name === "Festival")?.url || categoryImagesFromSettings[3].url,
      count: 28
    },
    {
      id: 5,
      name: "New Arrivals",
      image: categoryImagesFromSettings.find(c => c.name === "New Arrivals")?.url || categoryImagesFromSettings[4].url,
      count: 24
    },
    {
      id: 6,
      name: "Celebrity",
      image: categoryImagesFromSettings.find(c => c.name === "Celebrity")?.url || categoryImagesFromSettings[5].url,
      count: 16
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 
            className="text-foreground mb-4"
            style={{ 
              fontFamily: 'var(--font-family-inter)', 
              fontSize: 'var(--text-3xl)' 
            }}
          >
            Shop by Collection
          </h2>
          <p 
            className="text-muted-foreground"
            style={{ fontSize: 'var(--text-base)' }}
          >
            Explore our exquisite collection of sarees for every occasion
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="group cursor-pointer hover:shadow-md transition-all duration-300 border-border overflow-hidden"
              style={{ borderRadius: 'var(--radius)' }}
              onClick={() => onCategoryPageSelect ? onCategoryPageSelect(category.name) : onCategorySelect(category.name)}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-4 text-center">
                  <h3 
                    className="text-foreground mb-1"
                    style={{ 
                      fontFamily: 'var(--font-family-inter)', 
                      fontSize: 'var(--text-base)' 
                    }}
                  >
                    {category.name}
                  </h3>
                  <p 
                    className="text-muted-foreground"
                    style={{ fontSize: 'var(--text-sm)' }}
                  >
                    {category.count} items
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}