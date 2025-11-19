import { Product } from "./ProductCard";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { ChevronLeft, Heart } from "lucide-react";

interface WishlistProps {
  products: Product[];
  wishlist: number[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
  onProductClick: (productId: number) => void;
}

export function Wishlist({
  products,
  wishlist,
  onBack,
  onAddToCart,
  onToggleWishlist,
  onProductClick,
}: WishlistProps) {
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 border-b border-primary-foreground/20">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8" />
            <div>
              <h1 style={{ 
                fontFamily: 'var(--font-family-inter)', 
                fontSize: 'var(--text-3xl)' 
              }}>
                My Wishlist
              </h1>
              <p className="text-primary-foreground/80 mt-1" style={{ fontSize: 'var(--text-sm)' }}>
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 
              className="mb-2"
              style={{ 
                fontFamily: 'var(--font-family-inter)', 
                fontSize: 'var(--text-2xl)' 
              }}
            >
              Your Wishlist is Empty
            </h2>
            <p 
              className="text-muted-foreground mb-6" 
              style={{ fontSize: 'var(--text-base)' }}
            >
              Add items you love to your wishlist to save them for later
            </p>
            <Button 
              onClick={onBack}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={true}
                onClick={() => onProductClick(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}