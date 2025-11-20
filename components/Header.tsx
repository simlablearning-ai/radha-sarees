import { ShoppingCart, Search, Menu, Heart, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

interface HeaderProps {
  cartItems: number;
  onCartClick: () => void;
  onSearchChange: (value: string) => void;
  onAccountClick?: () => void;
  customerName?: string | null;
  onCategoryPageSelect?: (categoryName: string) => void;
  onWishlistClick?: () => void;
}

export function Header({ cartItems, onCartClick, onSearchChange, onAccountClick, customerName, onCategoryPageSelect, onWishlistClick }: HeaderProps) {
  const categories = ["Semi Silk Sarees", "Cotton Sarees", "Boutique Sarees", "Party wear sarees", "Under Rs.499"];

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
      {/* Top Bar */}
      <div className="bg-primary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-4">
              <p className="text-foreground/80" style={{ fontSize: 'var(--text-sm)' }}>Free Shipping on Orders Above ₹2,999</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-foreground/70 hover:text-foreground transition-colors" style={{ fontSize: 'var(--text-sm)' }}>
                Track Order
              </button>
              <button className="text-foreground/70 hover:text-foreground transition-colors" style={{ fontSize: 'var(--text-sm)' }}>
                Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header - Single Row with Primary Background */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="#" className="block">
                <h1 
                  className="text-primary-foreground whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ 
                    fontFamily: 'var(--font-family-inter)',
                    fontSize: 'var(--text-2xl)'
                  }}
                >
                  Radha Sarees
                </h1>
              </a>
            </div>

            {/* Navigation Menu - Desktop */}
            <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
              {categories.map((category) => (
                <button
                  key={category}
                  className="text-primary-foreground/90 hover:text-primary-foreground transition-colors whitespace-nowrap"
                  style={{ fontSize: 'var(--text-sm)' }}
                  onClick={(e) => {
                    e.preventDefault();
                    onCategoryPageSelect && onCategoryPageSelect(category);
                  }}
                >
                  {category}
                </button>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search for sarees..."
                  className="pl-10 bg-background/95 border-border/50 focus:border-primary-foreground h-9"
                  style={{ fontSize: 'var(--text-sm)' }}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    if (e.target.value.trim()) {
                      window.history.pushState({}, '', '/search');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      window.history.pushState({}, '', '/search');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                />
              </div>
            </div>

            {/* Actions - Account & Cart */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden sm:flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" 
                onClick={onAccountClick}
              >
                <User className="h-5 w-5" />
                <span className="hidden xl:inline" style={{ fontSize: 'var(--text-sm)' }}>
                  {customerName ? customerName : "Account"}
                </span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={onWishlistClick}
              >
                <Heart className="h-5 w-5" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground relative"
                onClick={onCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground border-2 border-primary">
                    <span style={{ fontSize: 'var(--text-xs)' }}>{cartItems}</span>
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for sarees..."
              className="pl-10 border-border h-9"
              style={{ fontSize: 'var(--text-sm)' }}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (e.target.value.trim()) {
                  window.history.pushState({}, '', '/search');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  window.history.pushState({}, '', '/search');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}