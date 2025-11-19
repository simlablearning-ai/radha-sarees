import { useState, useMemo } from "react";
import { ChevronLeft, Search as SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import { ProductCard, Product } from "./ProductCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";

interface SearchResultsProps {
  searchQuery: string;
  products: Product[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
  wishlist: number[];
  onProductClick: (productId: number) => void;
}

export function SearchResults({
  searchQuery,
  products,
  onBack,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  onProductClick,
}: SearchResultsProps) {
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState("all");

  // Filter products based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return products.filter(product => {
      const searchableText = [
        product.name,
        product.category,
        product.description || "",
        ...(product.tags || [])
      ].join(" ").toLowerCase();
      
      return searchableText.includes(query);
    });
  }, [products, searchQuery]);

  // Apply sorting and filtering
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...searchResults];

    // Apply price range filter
    if (priceRange !== "all") {
      result = result.filter(product => {
        const price = product.price;
        switch (priceRange) {
          case "under-1000":
            return price < 1000;
          case "1000-3000":
            return price >= 1000 && price < 3000;
          case "3000-5000":
            return price >= 3000 && price < 5000;
          case "above-5000":
            return price >= 5000;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => b.id - a.id);
        break;
      case "relevance":
      default:
        // Keep the original order (most relevant)
        break;
    }

    return result;
  }, [searchResults, sortBy, priceRange]);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Results Hero */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="mb-6 hover:bg-primary/10"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <SearchIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 
                className="text-foreground mb-2" 
                style={{ 
                  fontFamily: 'var(--font-family-inter)', 
                  fontSize: 'var(--text-3xl)' 
                }}
              >
                Search Results
              </h1>
              {searchQuery && (
                <p 
                  className="text-muted-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  Showing results for: <span className="text-foreground font-medium">"{searchQuery}"</span>
                </p>
              )}
            </div>
          </div>

          <p 
            className="text-muted-foreground"
            style={{ fontSize: 'var(--text-base)' }}
          >
            {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Sorting */}
        <Card className="mb-8 border-border" style={{ borderRadius: 'var(--radius)' }}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sort By */}
              <div>
                <label 
                  className="block text-foreground mb-2"
                  style={{ 
                    fontFamily: 'var(--font-family-inter)', 
                    fontSize: 'var(--text-sm)' 
                  }}
                >
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Most Relevant</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label 
                  className="block text-foreground mb-2"
                  style={{ 
                    fontFamily: 'var(--font-family-inter)', 
                    fontSize: 'var(--text-sm)' 
                  }}
                >
                  Price Range
                </label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-full border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-1000">Under ₹1,000</SelectItem>
                    <SelectItem value="1000-3000">₹1,000 - ₹3,000</SelectItem>
                    <SelectItem value="3000-5000">₹3,000 - ₹5,000</SelectItem>
                    <SelectItem value="above-5000">Above ₹5,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={wishlist.includes(product.id)}
                onProductClick={onProductClick}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-border" style={{ borderRadius: 'var(--radius)' }}>
            <SearchIcon className="h-16 w-16 text-muted mx-auto mb-4" />
            <h3 
              className="text-foreground mb-2"
              style={{ 
                fontFamily: 'var(--font-family-inter)', 
                fontSize: 'var(--text-xl)' 
              }}
            >
              No Results Found
            </h3>
            <p 
              className="text-muted-foreground mb-6"
              style={{ fontSize: 'var(--text-base)' }}
            >
              {searchQuery 
                ? `We couldn't find any products matching "${searchQuery}". Try different keywords or browse our categories.`
                : "Enter a search term to find products."
              }
            </p>
            <Button 
              onClick={onBack}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Browse All Categories
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
