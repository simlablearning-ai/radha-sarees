import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Product } from "./ProductCard";
import { ProductReviews } from "./ProductReviews";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { 
  ChevronLeft, 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Minus, 
  Plus,
  Truck,
  Shield,
  RotateCcw
} from "lucide-react";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, selectedVariation: string | null) => void;
  onToggleWishlist: (productId: number) => void;
  isInWishlist: boolean;
  relatedProducts: Product[];
  onProductClick: (productId: number) => void;
}

export function ProductDetail({
  product,
  onBack,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  relatedProducts,
  onProductClick,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    product.hasVariations && product.variations && product.variations.length > 0 
      ? product.variations[0].id 
      : null
  );

  // Get current variation details
  const currentVariation = product.hasVariations && selectedVariation
    ? product.variations?.find(v => v.id === selectedVariation)
    : null;

  // Calculate final price based on variation
  const finalPrice = product.price + (currentVariation?.priceAdjustment || 0);
  const finalOriginalPrice = product.originalPrice 
    ? product.originalPrice + (currentVariation?.priceAdjustment || 0)
    : undefined;

  // Calculate availability based on variation
  const isAvailable = product.hasVariations
    ? (currentVariation?.stock || 0) > 0
    : product.inStock;

  const currentStock = product.hasVariations
    ? currentVariation?.stock || 0
    : product.stock || 0;

  const discount = finalOriginalPrice
    ? Math.round(((finalOriginalPrice - finalPrice) / finalOriginalPrice) * 100)
    : 0;

  // Use variation-specific image if available, otherwise use product image
  const mainImage = (currentVariation?.image && currentVariation.image.trim()) 
    ? currentVariation.image 
    : product.image;
  const images = [mainImage, mainImage, mainImage, mainImage]; // In real app, product would have multiple images

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedVariation);
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    // Try to use native share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this amazing saree: ${product.name}`,
          url: url,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied to clipboard!");
      } catch (error) {
        console.error('Clipboard error:', error);
        toast.error("Failed to copy link");
      }
    }
  };

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
            Back to Products
          </Button>
        </div>
      </div>

      {/* Product Detail Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-lg border border-border bg-card">
              <ImageWithFallback
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-[500px] object-cover"
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  {discount}% OFF
                </Badge>
              )}
              {product.isOrganic && (
                <Badge className="absolute top-4 right-4 bg-chart-3 text-white">
                  Organic
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg border-2 overflow-hidden transition-all ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Product Name & Rating */}
            <div>
              <h1 className="text-foreground mb-3">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? "fill-chart-4 text-chart-4"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Color Variations */}
            {product.hasVariations && product.variations && product.variations.length > 0 && (
              <>
                <div className="space-y-3">
                  <label className="text-foreground">
                    Select Color: {currentVariation && (
                      <span className="text-primary">{currentVariation.color}</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.variations.map((variation) => {
                      const isSelected = selectedVariation === variation.id;
                      const isOutOfStock = variation.stock === 0;
                      return (
                        <button
                          key={variation.id}
                          onClick={() => !isOutOfStock && setSelectedVariation(variation.id)}
                          disabled={isOutOfStock}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : isOutOfStock
                              ? 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                              : 'border-border bg-card text-foreground hover:border-primary/50'
                          }`}
                        >
                          <div className="text-sm">
                            <div>{variation.color}</div>
                            {variation.priceAdjustment && variation.priceAdjustment !== 0 && (
                              <div className="text-xs mt-1">
                                {variation.priceAdjustment > 0 ? '+' : ''}
                                ₹{variation.priceAdjustment}
                              </div>
                            )}
                            {isOutOfStock && (
                              <div className="text-xs mt-1">Out of Stock</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-primary" style={{ fontSize: "var(--text-3xl)", fontWeight: "var(--font-weight-bold)" }}>
                  ₹{finalPrice.toLocaleString("en-IN")}
                </span>
                {finalOriginalPrice && (
                  <>
                    <span className="text-muted-foreground line-through">
                      ₹{finalOriginalPrice.toLocaleString("en-IN")}
                    </span>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Save {discount}%
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-muted-foreground">Inclusive of all taxes</p>
            </div>

            <Separator />

            {/* Product Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Availability:</span>
                <Badge className={isAvailable ? "bg-chart-3 text-white" : "bg-muted text-muted-foreground"}>
                  {isAvailable ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
              {currentStock !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Stock:</span>
                  <span className="text-muted-foreground">{currentStock} units available</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-foreground">Quantity:</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="rounded-r-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-6 py-2 text-foreground">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= 10}
                    className="rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-muted-foreground">Maximum 10 per order</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={!isAvailable}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border"
                onClick={() => onToggleWishlist(product.id)}
              >
                <Heart
                  className={`h-5 w-5 ${isInWishlist ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
                />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground">Free Delivery</p>
                    <p className="text-muted-foreground">Above ₹2,999</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground">100% Authentic</p>
                    <p className="text-muted-foreground">Certified Sarees</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground">Easy Returns</p>
                    <p className="text-muted-foreground">7 Days Policy</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-4">
              <h3 className="text-foreground">Product Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || `Experience the elegance of ${product.name}. This exquisite saree is crafted with premium quality fabric and features intricate designs that celebrate India's rich textile heritage. Perfect for ${product.category.toLowerCase()} occasions, this saree combines traditional artistry with contemporary appeal. The beautiful draping ensures a comfortable and luxurious look.`}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-foreground mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="group cursor-pointer hover:shadow-md transition-all border-border overflow-hidden"
                  onClick={() => onProductClick(relatedProduct.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-foreground line-clamp-2">{relatedProduct.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-primary">₹{relatedProduct.price.toLocaleString("en-IN")}</span>
                        {relatedProduct.originalPrice && (
                          <span className="text-muted-foreground line-through">
                            ₹{relatedProduct.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}