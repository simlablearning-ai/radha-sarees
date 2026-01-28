import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-primary">Radha Sarees</span>
            </div>
            <p className="text-sidebar-foreground/80 mb-4">
              Your destination for exquisite Indian sarees. 
              Celebrating tradition and elegance with every drape since 1995.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-sidebar-foreground/80 hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-sidebar-foreground/80 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-sidebar-foreground/80 hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-sidebar-foreground/80 hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sidebar-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sidebar-foreground/80">
              <li><a href="/" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">Our Heritage</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">Quality Promise</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sidebar-foreground mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sidebar-foreground/80">
              <li><a href="/" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">Returns & Exchanges</a></li>
              <li><a href="/terms-conditions" className="hover:text-primary transition-colors">Terms & Conditions</a></li>
              <li><a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sidebar-foreground mb-4">Stay Updated</h3>
            <p className="text-sidebar-foreground/80 mb-4">
              Subscribe to get special offers, new collections, and styling tips!
            </p>
            <div className="flex gap-2 mb-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
              />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Subscribe
              </Button>
            </div>
            
            <div className="space-y-2 text-sidebar-foreground/80">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 99999 88888</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@radhasarees.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Chennai, Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-sidebar-border" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sidebar-foreground/80 mb-4 md:mb-0">
            © 2024 Radha Sarees. All rights reserved.
          </div>
          <div className="flex gap-6 text-sidebar-foreground/80">
            <a href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms-conditions" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}