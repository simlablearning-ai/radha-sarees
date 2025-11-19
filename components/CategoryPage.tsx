import { useState, useMemo } from "react";
import { ChevronLeft, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { ProductCard, Product } from "./ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useStore } from "../lib/store";

interface CategoryPageProps {
  category: string;
  products: Product[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
  wishlist: number[];
  onProductClick: (productId: number) => void;
}

export function CategoryPage({
  category,
  products,
  onBack,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  onProductClick,
}: CategoryPageProps) {
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const { siteSettings } = useStore();

  // Get hero background settings from site settings
  const backgroundOpacity = siteSettings.heroBackgroundOpacity || 0.5;
  const overlayOpacity = siteSettings.heroOverlayOpacity || 0.3;
  const overlayColor = siteSettings.heroOverlayColor || '#000000';
  const customBackgroundImage = siteSettings.customBackgroundImage;

  // Get category image from site settings or use fallback
  const getCategoryImage = () => {
    if (siteSettings.categoryImages) {
      const categoryImage = siteSettings.categoryImages.find(
        (img) => img.name === category
      );
      if (categoryImage?.url) {
        return categoryImage.url;
      }
    }
    // Fallback images based on category
    const fallbackImages: { [key: string]: string } = {
      Wedding: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
      Ethnic: "https://images.unsplash.com/photo-1583391733981-0b46bbf14a37?w=800&q=80",
      Casuals: "https://images.unsplash.com/photo-1624206112918-f140f087f9db?w=800&q=80",
      Festival: "https://images.unsplash.com/photo-1610030469038-1f0d0c5d3d7c?w=800&q=80",
      "New Arrivals": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80",
      Celebrity: "https://images.unsplash.com/photo-1610030469664-cecb55f22d98?w=800&q=80",
    };
    return fallbackImages[category] || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80";
  };

  // Category descriptions
  const categoryDescriptions: { [key: string]: string } = {
    Wedding: "Discover our stunning collection of bridal and wedding sarees featuring rich fabrics, intricate embroidery, and timeless designs perfect for your special day.",
    Ethnic: "Traditional ethnic sarees that celebrate India's cultural heritage with authentic designs and premium quality fabrics.",
    Casuals: "Comfortable and stylish casual sarees perfect for everyday wear, office, or informal gatherings.",
    Festival: "Vibrant festive sarees featuring rich colors and traditional patterns ideal for celebrations and special occasions.",
    "New Arrivals": "Check out our latest collection featuring contemporary designs and trending styles.",
    Celebrity: "Get the celebrity look with our designer sarees inspired by Bollywood fashion.",
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by price range
    if (priceRange === "under-5000") {
      filtered = filtered.filter((p) => p.price < 5000);
    } else if (priceRange === "5000-10000") {
      filtered = filtered.filter((p) => p.price >= 5000 && p.price <= 10000);
    } else if (priceRange === "10000-20000") {
      filtered = filtered.filter((p) => p.price >= 10000 && p.price <= 20000);
    } else if (priceRange === "above-20000") {
      filtered = filtered.filter((p) => p.price > 20000);
    }

    // Sort products
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => b.id - a.id);
    }

    return filtered;
  }, [products, sortBy, priceRange]);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb & Back Button */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-foreground hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Category Hero */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        {/* Custom Background Image from Hero Settings */}
        {customBackgroundImage && (
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${customBackgroundImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: backgroundOpacity
            }}
          />
        )}

        {/* Background Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />

        {/* Category Image Layer */}
        <ImageWithFallback
          src={getCategoryImage()}
          alt={category}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.3 }}
        />

        {/* Content Layer */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10">
            <h1 
              className="text-foreground mb-4 drop-shadow-lg" 
              style={{ 
                fontFamily: 'var(--font-family-inter)', 
                fontSize: 'var(--text-3xl)' 
              }}
            >
              {category} Sarees
            </h1>
            <p 
              className="text-muted-foreground max-w-2xl mx-auto px-4 drop-shadow-md"
              style={{ fontSize: 'var(--text-base)' }}
            >
              {categoryDescriptions[category] || "Explore our exquisite collection"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Product Count */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {filteredAndSortedProducts.length} Products
              </span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Price Range Filter */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-[180px] border-border">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-5000">Under ₹5,000</SelectItem>
                  <SelectItem value="5000-10000">₹5,000 - ₹10,000</SelectItem>
                  <SelectItem value="10000-20000">₹10,000 - ₹20,000</SelectItem>
                  <SelectItem value="above-20000">Above ₹20,000</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] border-border">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={wishlist.includes(product.id)}
                onClick={() => onProductClick(product.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No products found matching your filters.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSortBy("featured");
                  setPriceRange("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}