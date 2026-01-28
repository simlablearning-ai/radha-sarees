import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useStore } from "../lib/store";
import { toCategoryUrl } from "../lib/urlUtils";

interface Category {
  id: string;
  name: string;
  displayName: string;
  image: string;
  url: string;
  count: number;
}

interface CategoriesProps {
  onCategorySelect: (categoryName: string) => void;
  onCategoryPageSelect?: (categoryName: string) => void;
}

export function Categories({ onCategorySelect, onCategoryPageSelect }: CategoriesProps) {
  const { siteSettings, products } = useStore();
  
  // Get categories from settings or use defaults
  const categoriesConfig = siteSettings.categories || [
    { id: 'festival', name: 'Festival', displayName: 'Festival Sarees', url: '/category/festival' },
    { id: 'casual', name: 'Casual', displayName: 'Casual Sarees', url: '/category/casual' },
    { id: 'ethnic', name: 'Ethnic', displayName: 'Ethnic Sarees', url: '/category/ethnic' },
    { id: 'fancy', name: 'Fancy', displayName: 'Fancy Sarees', url: '/category/fancy' }
  ];

  // Default images for categories
  const defaultImages: { [key: string]: string } = {
    'festival': 'https://images.unsplash.com/photo-1758979807529-0beb03394099?w=800',
    'casual': 'https://images.unsplash.com/photo-1601291791976-6ad855ca1a27?w=800',
    'ethnic': 'https://images.unsplash.com/photo-1769500801394-ca7dbd6cd433?w=800',
    'fancy': 'https://images.unsplash.com/photo-1756483492198-8ca91227489b?w=800'
  };
  
  // Get category images from settings
  const categoryImagesFromSettings = siteSettings.categoryImages || [];

  // Build categories with counts and images
  const categories: Category[] = categoriesConfig.map((cat, index) => {
    // Count products in this category
    let count = 0;
    
    // Count products matching category name
    count = products.filter(p => 
      p.category === cat.name || 
      (p.categories && p.categories.includes(cat.name))
    ).length;

    // Get image from settings or use default
    const imageFromSettings = categoryImagesFromSettings.find(c => c.name === cat.name);
    const image = imageFromSettings?.url || defaultImages[cat.id] || defaultImages['semi-silk'];

    return {
      id: cat.id,
      name: cat.name,
      displayName: cat.displayName,
      image,
      url: cat.url,
      count
    };
  });

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
            Shop by Categories
          </h2>
          <p 
            className="text-muted-foreground"
            style={{ fontSize: 'var(--text-base)' }}
          >
            Explore our exquisite collection of sarees for every occasion
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    alt={category.displayName}
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
                    {category.displayName}
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