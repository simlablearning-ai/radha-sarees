import { useState, useEffect, useMemo } from "react";
import { useStore } from "./lib/store";
import { useDataSync, syncedActions } from "./lib/useData";
import { Hero } from "./components/Hero";
import { ProductDetail } from "./components/ProductDetail";
import { CategoryPage } from "./components/CategoryPage";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Categories } from "./components/Categories";
import { Features } from "./components/Features";
import { ProductGrid } from "./components/ProductGrid";
import { Cart } from "./components/Cart";
import { Checkout } from "./components/Checkout";
import { AdminPanel } from "./components/admin/AdminPanel";
import { CustomerAuth } from "./components/CustomerAuth";
import { CustomerDashboard } from "./components/CustomerDashboard";
import { Button } from "./components/ui/button";
import { Settings } from "lucide-react";
import { toast } from "sonner";

type ViewType = 'store' | 'admin' | 'product' | 'category' | 'customer-dashboard';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  tags?: string[];
  stock?: number;
}

export default function App() {
  const { products, isCustomerAuthenticated, currentCustomer } = useStore();
  const { isLoading, isInitialized } = useDataSync();
  const [view, setView] = useState<ViewType>('store');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedCategoryForPage, setSelectedCategoryForPage] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle URL hash for routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setView('admin');
      } else if (hash === '#customer-dashboard') {
        setView('customer-dashboard');
      } else {
        setView('store');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Featured products - filtered by "featured" tag for homepage
  const featuredProducts = useMemo(() => {
    return products.filter(product => 
      product.tags && product.tags.includes('featured')
    );
  }, [products]);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // If admin view, render admin panel
  if (view === 'admin') {
    return <AdminPanel />;
  }

  // If customer dashboard view, render customer dashboard
  if (view === 'customer-dashboard') {
    return <CustomerDashboard onLogout={handleCustomerLogout} />;
  }

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.id !== productId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    toast.success("Item removed from cart");
  };

  const handleToggleWishlist = (productId: number) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        toast.success("Removed from wishlist");
        return prev.filter(id => id !== productId);
      } else {
        toast.success("Added to wishlist");
        return [...prev, productId];
      }
    });
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const handleCategoryPageSelect = (categoryName: string) => {
    setSelectedCategoryForPage(categoryName);
    setView('category');
    window.scrollTo(0, 0);
  };

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setView('product');
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setView('store');
    setSelectedProductId(null);
    setSelectedCategoryForPage(null);
    setSelectedCategory(null);
    window.scrollTo(0, 0);
  };

  const handleAddToCartWithQuantity = (product: Product, quantity: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { ...product, quantity }];
      }
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    setCartItems([]);
    toast.success("Thank you for your order!");
  };

  const handleAccountClick = () => {
    if (isCustomerAuthenticated) {
      window.location.hash = '#customer-dashboard';
      setView('customer-dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleCustomerLogin = async (email: string, password: string) => {
    console.log('handleCustomerLogin called with:', email);
    const success = await syncedActions.customerLogin(email, password);
    console.log('Login result:', success);
    if (success) {
      setShowAuthModal(false);
      window.location.hash = '#customer-dashboard';
      setView('customer-dashboard');
    }
  };

  const handleCustomerSignup = async (data: any) => {
    console.log('handleCustomerSignup called with:', data);
    const { password, ...profileData } = data;
    const success = await syncedActions.customerSignup(profileData, password);
    console.log('Signup result:', success);
    if (success) {
      setShowAuthModal(false);
      window.location.hash = '#customer-dashboard';
      setView('customer-dashboard');
    }
  };

  const handleCustomerLogout = () => {
    // Clear session from localStorage
    localStorage.removeItem('supabase_session');
    
    // Clear from local store
    syncedActions.customerLogout();
    
    toast.success("Logged out successfully");
    window.location.hash = '';
    setView('store');
  };

  // Get selected product
  const selectedProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;

  // Get related products (same category)
  const relatedProducts = selectedProduct
    ? products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    : [];

  // Get category products
  const categoryProducts = selectedCategoryForPage
    ? products.filter(p => p.category === selectedCategoryForPage)
    : [];

  // Render Product Detail Page
  if (view === 'product' && selectedProduct) {
    return (
      <>
        <ProductDetail
          product={selectedProduct}
          onBack={handleBackToHome}
          onAddToCart={handleAddToCartWithQuantity}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={wishlist.includes(selectedProduct.id)}
          relatedProducts={relatedProducts}
          onProductClick={handleProductClick}
        />
        
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onProceedToCheckout={handleProceedToCheckout}
        />

        <Checkout
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          onCheckoutComplete={handleCheckoutComplete}
        />
      </>
    );
  }

  // Render Category Page
  if (view === 'category' && selectedCategoryForPage) {
    return (
      <>
        <Header
          cartItems={totalCartItems}
          onCartClick={() => setIsCartOpen(true)}
          onSearchChange={setSearchQuery}
          onAccountClick={handleAccountClick}
          customerName={currentCustomer?.name}
          onCategoryPageSelect={handleCategoryPageSelect}
        />
        
        <CategoryPage
          category={selectedCategoryForPage}
          products={categoryProducts}
          onBack={handleBackToHome}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlist={wishlist}
          onProductClick={handleProductClick}
        />
        
        <Footer />
        
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onProceedToCheckout={handleProceedToCheckout}
        />

        <Checkout
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          onCheckoutComplete={handleCheckoutComplete}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Link - Fixed position */}
      <a
        href="#admin"
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Settings className="h-5 w-5 mr-2" />
          Admin Panel
        </Button>
      </a>

      <Header
        cartItems={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
        onSearchChange={setSearchQuery}
        onAccountClick={handleAccountClick}
        customerName={currentCustomer?.name}
        onCategoryPageSelect={handleCategoryPageSelect}
      />
      
      <Hero />
      
      <Categories 
        onCategorySelect={handleCategorySelect}
        onCategoryPageSelect={handleCategoryPageSelect}
      />
      
      <Features />
      
      <ProductGrid
        products={featuredProducts.length > 0 ? featuredProducts : filteredProducts}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        wishlist={wishlist}
        onProductClick={handleProductClick}
      />
      
      <Footer />
      
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onCheckoutComplete={handleCheckoutComplete}
      />

      <CustomerAuth
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleCustomerLogin}
        onSignup={handleCustomerSignup}
      />

      <Button
        size="lg"
        className="fixed bottom-6 left-6 z-50"
        onClick={handleAccountClick}
      >
        {isCustomerAuthenticated ? 'My Account' : 'Login/Signup'}
      </Button>
    </div>
  );
}