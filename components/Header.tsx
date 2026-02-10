import { ShoppingCart, Search, Menu, Heart, User, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
// Replaced figma:asset import with a placeholder URL for Vercel deployment compatibility
// TODO: Replace this URL with your hosted logo image URL
const logoImage = "https://images.unsplash.com/photo-1616606103915-dea7be788566?ixlib=rb-4.1.0&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max";

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
  const categories = ["Festival", "Casual", "Ethnic", "Fancy"];

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
      {/* Main Header - Single Row with Primary Background */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 h-24">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="#" className="block">
                <div className="h-20 w-auto overflow-hidden flex items-center bg-white rounded-[5px] p-1">
                   <ImageWithFallback 
                     src={logoImage} 
                     alt="Radha Sarees" 
                     className="h-full w-auto object-contain"
                   />
                </div>
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
                onClick={() => {
                  window.history.pushState({}, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                <Lock className="h-5 w-5" />
                <span className="hidden xl:inline" style={{ fontSize: 'var(--text-sm)' }}>
                  Admin
                </span>
              </Button>

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
