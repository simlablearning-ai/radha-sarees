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
}

export function Header({ cartItems, onCartClick, onSearchChange, onAccountClick, customerName, onCategoryPageSelect }: HeaderProps) {
  const categories = ["Wedding", "Ethnic", "Casuals", "Festival", "New Arrivals", "Celebrity"];

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
      {/* Top Bar */}
      <div className="bg-primary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-4">
              <p className="text-foreground/80">Free Shipping on Orders Above ₹2,999</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-foreground/70 hover:text-foreground transition-colors">
                Track Order
              </button>
              <button className="text-foreground/70 hover:text-foreground transition-colors">
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
              <h1 className="text-primary-foreground whitespace-nowrap">Radha Sarees</h1>
            </div>

            {/* Navigation Menu - Desktop */}
            <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
              {categories.map((category) => (
                <a
                  key={category}
                  href={`#${category.toLowerCase().replace(' ', '-')}`}
                  className="text-primary-foreground/90 hover:text-primary-foreground transition-colors whitespace-nowrap"
                  onClick={() => onCategoryPageSelect && onCategoryPageSelect(category)}
                >
                  {category}
                </a>
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
                  onChange={(e) => onSearchChange(e.target.value)}
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
                <span className="hidden xl:inline">{customerName ? customerName : "Account"}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Heart className="h-5 w-5" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="relative text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={onCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary-foreground text-primary"
                  >
                    {cartItems}
                  </Badge>
                )}
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for sarees, collections..."
              className="pl-10 bg-muted border-border focus:border-primary"
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}