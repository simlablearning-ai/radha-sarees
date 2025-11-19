import { ShoppingCart, Heart, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  weight: string;
  isOrganic?: boolean;
  inStock: boolean;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
  isInWishlist: boolean;
  onClick?: () => void;
}

export function ProductCard({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  isInWishlist,
  onClick
}: ProductCardProps) {
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
  };

  return (
    <Card 
      className="group hover:shadow-md transition-all duration-300 border-border overflow-hidden bg-card cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground shadow-sm">
                {discount}% OFF
              </Badge>
            )}
            {product.isOrganic && (
              <Badge className="bg-chart-3 text-white shadow-sm">
                Organic
              </Badge>
            )}
          </div>
          
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 bg-card/90 hover:bg-card border border-border shadow-sm"
            onClick={(e) => handleButtonClick(e, () => onToggleWishlist(product.id))}
          >
            <Heart 
              className={`h-4 w-4 ${isInWishlist ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} 
            />
          </Button>
          
          {/* Quick Add to Cart on Hover */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              onClick={(e) => handleButtonClick(e, () => onAddToCart(product))}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!product.inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <h3 
            className="text-foreground line-clamp-2"
            style={{ 
              fontFamily: 'var(--font-family-inter)', 
              fontSize: 'var(--text-base)' 
            }}
          >
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-chart-4 text-chart-4'
                      : 'text-muted'
                  }`} 
                />
              ))}
            </div>
            <span 
              className="text-muted-foreground"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              ({product.reviews})
            </span>
          </div>
          
          <p 
            className="text-muted-foreground"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            {product.weight}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span 
                className="text-primary"
                style={{ 
                  fontFamily: 'var(--font-family-inter)', 
                  fontSize: 'var(--text-lg)' 
                }}
              >
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              onClick={(e) => handleButtonClick(e, () => onAddToCart(product))}
              disabled={!product.inStock}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}