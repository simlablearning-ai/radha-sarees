import { useState, useEffect, useMemo } from "react";
import { useStore } from "./lib/store";
import { useDataSync, syncedActions } from "./lib/useData";
import { Hero } from "./components/Hero";
import { ProductDetail } from "./components/ProductDetail";
import { CategoryPage } from "./components/CategoryPage";
import { Wishlist } from "./components/Wishlist";
import { SearchResults } from "./components/SearchResults";
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
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

type ViewType = 'store' | 'admin' | 'product' | 'category' | 'customer-dashboard' | 'wishlist' | 'search';

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

  // Handle URL routing (SEO-friendly)
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      
      if (path === '/admin') {
        setView('admin');
      } else if (path === '/customer-dashboard') {
        setView('customer-dashboard');
      } else if (path.startsWith('/product/')) {
        const productId = parseInt(path.replace('/product/', ''));
        if (!isNaN(productId)) {
          setSelectedProductId(productId);
          setView('product');
        }
      } else if (path.startsWith('/category/')) {
        const category = decodeURIComponent(path.replace('/category/', ''));
        setSelectedCategoryForPage(category);
        setView('category');
      } else if (path === '/wishlist') {
        setView('wishlist');
      } else if (path === '/search') {
        setView('search');
      } else {
        setView('store');
        setSelectedProductId(null);
        setSelectedCategoryForPage(null);
      }
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
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

  // Limited products for homepage - show only 8 products
  const homepageProducts = useMemo(() => {
    if (featuredProducts.length > 0) {
      // If there are featured products, show first 8
      return featuredProducts.slice(0, 8);
    } else {
      // Otherwise show first 8 filtered products
      return filteredProducts.slice(0, 8);
    }
  }, [featuredProducts, filteredProducts]);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Define handler functions before they are used
  const handleCustomerLogout = () => {
    // Clear session from localStorage
    localStorage.removeItem('supabase_session');
    
    // Clear from local store
    syncedActions.customerLogout();
    
    toast.success("Logged out successfully");
    window.history.pushState({}, '', '/');
    setView('store');
  };

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
    window.history.pushState({}, '', `/category/${encodeURIComponent(categoryName)}`);
    setSelectedCategoryForPage(categoryName);
    setView('category');
    window.scrollTo(0, 0);
  };

  const handleProductClick = (productId: number) => {
    window.history.pushState({}, '', `/product/${productId}`);
    setSelectedProductId(productId);
    setView('product');
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    setView('store');
    setSelectedProductId(null);
    setSelectedCategoryForPage(null);
    window.scrollTo(0, 0);
  };

  const handleWishlistClick = () => {
    window.history.pushState({}, '', '/wishlist');
    setView('wishlist');
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
      window.history.pushState({}, '', '/customer-dashboard');
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
      window.history.pushState({}, '', '/customer-dashboard');
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
      window.history.pushState({}, '', '/customer-dashboard');
      setView('customer-dashboard');
    }
  };

  // If admin view, render admin panel
  if (view === 'admin') {
    return (
      <>
        <AdminPanel />
        <Toaster />
      </>
    );
  }

  // If customer dashboard view, render customer dashboard
  if (view === 'customer-dashboard') {
    return (
      <>
        <CustomerDashboard onLogout={handleCustomerLogout} />
        <Toaster />
      </>
    );
  }

  // If wishlist view, render wishlist
  if (view === 'wishlist') {
    return (
      <>
        <Header
          cartItems={totalCartItems}
          onCartClick={() => setIsCartOpen(true)}
          onSearchChange={setSearchQuery}
          onAccountClick={handleAccountClick}
          customerName={currentCustomer?.name}
          onCategoryPageSelect={handleCategoryPageSelect}
          onWishlistClick={handleWishlistClick}
        />
        
        <Wishlist
          products={products.filter(p => wishlist.includes(p.id))}
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

        <Toaster />
      </>
    );
  }

  // If search view, render search results
  if (view === 'search') {
    return (
      <>
        <Header
          cartItems={totalCartItems}
          onCartClick={() => setIsCartOpen(true)}
          onSearchChange={setSearchQuery}
          onAccountClick={handleAccountClick}
          customerName={currentCustomer?.name}
          onCategoryPageSelect={handleCategoryPageSelect}
          onWishlistClick={handleWishlistClick}
        />
        
        <SearchResults
          searchQuery={searchQuery}
          products={products}
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

        <Toaster />
      </>
    );
  }

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
        <Header
          cartItems={totalCartItems}
          onCartClick={() => setIsCartOpen(true)}
          onSearchChange={setSearchQuery}
          onAccountClick={handleAccountClick}
          customerName={currentCustomer?.name}
          onCategoryPageSelect={handleCategoryPageSelect}
          onWishlistClick={handleWishlistClick}
        />
        
        <ProductDetail
          product={selectedProduct}
          onBack={handleBackToHome}
          onAddToCart={handleAddToCartWithQuantity}
          onToggleWishlist={handleToggleWishlist}
          isInWishlist={wishlist.includes(selectedProduct.id)}
          relatedProducts={relatedProducts}
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

        <Toaster />
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
          onWishlistClick={handleWishlistClick}
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

        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItems={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
        onSearchChange={setSearchQuery}
        onAccountClick={handleAccountClick}
        customerName={currentCustomer?.name}
        onCategoryPageSelect={handleCategoryPageSelect}
        onWishlistClick={handleWishlistClick}
      />
      
      <Hero />
      
      <Categories 
        onCategorySelect={handleCategorySelect}
        onCategoryPageSelect={handleCategoryPageSelect}
      />
      
      <Features />
      
      <ProductGrid
        products={homepageProducts}
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

      <Toaster />
    </div>
  );
}