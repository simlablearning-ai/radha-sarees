import { ProductCard, Product } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: number) => void;
  wishlist: number[];
  onProductClick?: (productId: number) => void;
}

export function ProductGrid({ 
  products, 
  onAddToCart, 
  onToggleWishlist, 
  wishlist,
  onProductClick
}: ProductGridProps) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-foreground mb-4">
            Featured Saree Collection
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Handcrafted sarees showcasing India's rich textile heritage and contemporary fashion
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isInWishlist={wishlist.includes(product.id)}
              onClick={onProductClick ? () => onProductClick(product.id) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}