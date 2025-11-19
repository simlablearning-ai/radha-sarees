// Centralized data store for products, orders, and settings
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from './api';

export interface ProductVariation {
  id: string;
  color: string;
  stock: number;
  priceAdjustment?: number; // Optional price difference from base price
  image?: string; // Optional variation-specific image
}

export interface ProductReview {
  id: string;
  productId: number;
  customerName: string;
  customerId?: string; // Optional: links to customer profile
  rating: number; // 1-5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  isManualReview?: boolean; // Added by admin manually
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  weight: string;
  isOrganic: boolean;
  inStock: boolean;
  stock?: number; // Add stock field
  category: string; // Keep for backward compatibility
  categories: string[]; // New: Multiple categories
  tags: string[]; // New: Tags like "featured", "new-arrival", "bestseller"
  description?: string;
  customerReviews?: ProductReview[]; // Customer reviews
  totalSales?: number; // Random sales number for display
  hasVariations?: boolean; // Whether product has color variations
  variations?: ProductVariation[]; // Color variations with individual stock
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  image: string;
  selectedVariation?: { color: string }; // Selected color variation if product has variations
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentGateway {
  id: string;
  name: string;
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'sales' | 'inventory' | 'customers' | 'revenue';
  dateRange: { start: string; end: string };
  generatedAt: string;
  data: any;
}

export type HeroAnimationType = 'float' | 'rotate' | 'scale' | 'slide';

export interface HeroImage {
  title: string;
  url: string;
}

export interface CategoryImage {
  name: string;
  url: string;
}

export interface SiteSettings {
  heroAnimation: HeroAnimationType;
  heroBackgroundOpacity: number;
  heroOverlayOpacity: number; // New: Overlay opacity
  heroOverlayColor: string; // New: Overlay color (CSS variable or hex)
  customBackgroundImage?: string; // Base64 or URL for custom uploads
  featuredProductIds?: number[]; // Product IDs to feature on homepage
  heroImages?: HeroImage[]; // Images for hero section
  categoryImages?: CategoryImage[]; // Images for category section
  heroShowCategories?: boolean; // Show/hide category boxes on hero section
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
}

export interface CustomerPaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking';
  name: string;
  details: string; // Last 4 digits for card, UPI ID, etc.
  isDefault: boolean;
}

export interface CustomerBillingAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface StoreState {
  products: Product[];
  orders: Order[];
  paymentGateways: PaymentGateway[];
  reports: Report[];
  siteSettings: SiteSettings;
  
  // Authentication
  isAdminAuthenticated: boolean;
  adminUsername: string | null;
  
  // Customer data
  isCustomerAuthenticated: boolean;
  currentCustomer: CustomerProfile | null;
  customerPaymentMethods: CustomerPaymentMethod[];
  customerBillingAddresses: CustomerBillingAddress[];
  customerCredentials: { [email: string]: string }; // email -> password mapping (for demo)
  customerProfiles: { [email: string]: CustomerProfile }; // email -> profile mapping (for demo)
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  bulkAddProducts: (products: Omit<Product, 'id'>[]) => void;
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  
  // Payment gateway actions
  updatePaymentGateway: (id: string, gateway: Partial<PaymentGateway>) => void;
  
  // Report actions
  generateReport: (report: Omit<Report, 'id' | 'generatedAt'>) => void;
  deleteReport: (id: string) => void;
  
  // Settings actions
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  
  // Authentication actions
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  // Customer authentication actions
  customerLogin: (email: string, password: string) => boolean;
  customerSignup: (profile: Omit<CustomerProfile, 'id' | 'createdAt'>, password: string) => boolean;
  customerLogout: () => void;
  setCustomerProfile: (profile: CustomerProfile) => void;
  updateCustomerProfile: (profile: Partial<CustomerProfile>) => void;
  
  // Customer payment methods
  addPaymentMethod: (method: Omit<CustomerPaymentMethod, 'id'>) => void;
  updatePaymentMethod: (id: string, method: Partial<CustomerPaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;
  
  // Customer billing addresses
  addBillingAddress: (address: Omit<CustomerBillingAddress, 'id'>) => void;
  updateBillingAddress: (id: string, address: Partial<CustomerBillingAddress>) => void;
  deleteBillingAddress: (id: string) => void;
  
  // Review actions
  addReview: (review: Omit<ProductReview, 'id' | 'createdAt'>) => void;
  deleteReview: (reviewId: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      products: [
        {
          id: 1,
          name: "Royal Banarasi Silk Saree - Bridal Red",
          price: 18999,
          originalPrice: 25999,
          image: "/images/banarasi-silk-red.jpg",
          rating: 4.9,
          reviews: 187,
          weight: "Pure Silk",
          isOrganic: false,
          inStock: true,
          stock: 10,
          category: "Wedding",
          categories: ["Wedding", "Silk"],
          tags: ["featured", "new-arrival"],
          description: "Luxurious Banarasi silk saree with intricate zari work, perfect for weddings",
          totalSales: 1247,
          customerReviews: [
            {
              id: "RVW-1",
              productId: 1,
              customerName: "Priya Sharma",
              rating: 5,
              title: "Absolutely Stunning!",
              comment: "The quality of this Banarasi silk is exceptional. The zari work is intricate and beautiful. Perfect for my wedding!",
              isVerifiedPurchase: true,
              createdAt: "2024-11-10T10:30:00Z"
            },
            {
              id: "RVW-2",
              productId: 1,
              customerName: "Anjali Patel",
              rating: 5,
              title: "Worth Every Penny",
              comment: "Gorgeous saree with excellent craftsmanship. The color is vibrant and true to the pictures. Highly recommended!",
              isVerifiedPurchase: true,
              createdAt: "2024-11-08T14:20:00Z"
            },
            {
              id: "RVW-3",
              productId: 1,
              customerName: "Meera Reddy",
              rating: 4,
              title: "Beautiful but Heavy",
              comment: "The saree is absolutely beautiful and the quality is top-notch. Only downside is it's quite heavy to wear for long hours.",
              isVerifiedPurchase: true,
              createdAt: "2024-11-05T09:15:00Z"
            }
          ]
        },
        {
          id: 2,
          name: "Kanjeevaram Wedding Saree - Golden Border",
          price: 24999,
          originalPrice: 32999,
          image: "/images/kanjeevaram-golden.jpg",
          rating: 5.0,
          reviews: 143,
          weight: "Pure Kanjivaram Silk",
          isOrganic: false,
          inStock: true,
          stock: 5,
          category: "Wedding",
          categories: ["Wedding", "Silk"],
          tags: ["bestseller"],
          description: "Authentic Kanjeevaram silk with rich golden border and traditional motifs",
          totalSales: 892
        },
        {
          id: 3,
          name: "Designer Embroidered Saree - Bridal Collection",
          price: 15999,
          originalPrice: 21999,
          image: "/images/designer-embroidered.jpg",
          rating: 4.8,
          reviews: 234,
          weight: "Georgette with Embroidery",
          isOrganic: false,
          inStock: true,
          stock: 8,
          category: "Wedding",
          categories: ["Wedding", "Embroidery"],
          tags: ["new-arrival"],
          description: "Contemporary designer saree with exquisite embroidery work",
          totalSales: 1534
        },
        {
          id: 4,
          name: "Traditional Silk Saree - Ethnic Wear",
          price: 8999,
          originalPrice: 12999,
          image: "/images/traditional-silk.jpg",
          rating: 4.7,
          reviews: 298,
          weight: "Pure Silk",
          isOrganic: false,
          inStock: true,
          stock: 15,
          category: "Ethnic",
          categories: ["Ethnic", "Silk"],
          tags: ["featured"],
          description: "Classic silk saree for traditional occasions and festivities",
          totalSales: 2156
        },
        {
          id: 5,
          name: "Cotton Saree - Daily Wear Casual",
          price: 2499,
          originalPrice: 3499,
          image: "/images/cotton-casual.jpg",
          rating: 4.6,
          reviews: 423,
          weight: "Cotton Blend",
          isOrganic: true,
          inStock: true,
          stock: 20,
          category: "Casuals",
          categories: ["Casuals", "Cotton"],
          tags: ["new-arrival"],
          description: "Comfortable cotton saree perfect for everyday wear",
          totalSales: 3421
        },
        {
          id: 6,
          name: "Premium Silk Saree - Multi Color Collection",
          price: 12999,
          originalPrice: 17999,
          image: "/images/silk-multicolor.jpg",
          rating: 4.8,
          reviews: 156,
          weight: "Pure Silk",
          isOrganic: false,
          inStock: true,
          category: "Wedding",
          categories: ["Wedding", "Silk"],
          tags: ["featured", "bestseller"],
          description: "Elegant silk saree available in multiple stunning colors. Perfect for weddings and special occasions.",
          totalSales: 987,
          hasVariations: true,
          variations: [
            {
              id: "VAR-1",
              color: "Royal Blue",
              stock: 8,
              priceAdjustment: 0
            },
            {
              id: "VAR-2",
              color: "Maroon Red",
              stock: 12,
              priceAdjustment: 0
            },
            {
              id: "VAR-3",
              color: "Emerald Green",
              stock: 5,
              priceAdjustment: 0
            },
            {
              id: "VAR-4",
              color: "Golden Yellow",
              stock: 10,
              priceAdjustment: 500 // ₹500 more for this color
            }
          ]
        },
      ],
      orders: [],
      paymentGateways: [
        { id: 'razorpay', name: 'Razorpay', enabled: false },
        { id: 'phonepe', name: 'PhonePe', enabled: false },
      ],
      reports: [],
      siteSettings: {
        heroAnimation: 'float',
        heroBackgroundOpacity: 0.5,
        heroOverlayOpacity: 0.3,
        heroOverlayColor: '#000000',
        heroShowCategories: true // Default to showing categories
      },
      
      // Authentication
      isAdminAuthenticated: false,
      adminUsername: null,

      // Customer data
      isCustomerAuthenticated: false,
      currentCustomer: null,
      customerPaymentMethods: [],
      customerBillingAddresses: [],
      customerCredentials: {},
      customerProfiles: {},
      
      // Product actions
      addProduct: (product) => set((state) => {
        // If product already has an ID (from backend), use it
        // Otherwise generate a new one
        const productId = product.id || (Math.max(0, ...state.products.map(p => p.id)) + 1);
        return { products: [...state.products, { ...product, id: productId }] };
      }),

      updateProduct: (id, product) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...product } : p)
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),

      bulkAddProducts: (products) => set((state) => {
        let maxId = Math.max(0, ...state.products.map(p => p.id));
        const newProducts = products.map(p => ({ ...p, id: ++maxId }));
        return { products: [...state.products, ...newProducts] };
      }),

      // Order actions
      addOrder: (order) => set((state) => {
        const newOrder: Order = {
          ...order,
          id: `ORD-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { orders: [...state.orders, newOrder] };
      }),

      updateOrder: (id, order) => set((state) => ({
        orders: state.orders.map(o => 
          o.id === id ? { ...o, ...order, updatedAt: new Date().toISOString() } : o
        )
      })),

      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o =>
          o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
        )
      })),

      // Payment gateway actions
      updatePaymentGateway: (id, gateway) => set((state) => ({
        paymentGateways: state.paymentGateways.map(g =>
          g.id === id ? { ...g, ...gateway } : g
        )
      })),

      // Report actions
      generateReport: (report) => set((state) => {
        const newReport: Report = {
          ...report,
          id: `RPT-${Date.now()}`,
          generatedAt: new Date().toISOString(),
        };
        return { reports: [...state.reports, newReport] };
      }),

      deleteReport: (id) => set((state) => ({
        reports: state.reports.filter(r => r.id !== id)
      })),
      
      // Settings actions
      updateSiteSettings: (settings) => set((state) => ({
        siteSettings: { ...state.siteSettings, ...settings }
      })),
      
      // Authentication actions
      login: (username, password) => {
        if (username === 'admin' && password === 'admin123') {
          set({ isAdminAuthenticated: true, adminUsername: username });
          return true;
        }
        return false;
      },
      logout: () => set({ isAdminAuthenticated: false, adminUsername: null }),
      
      // Customer authentication actions
      customerLogin: (email, password) => {
        const state = useStore.getState();
        const storedPassword = state.customerCredentials[email];
        if (storedPassword && storedPassword === password) {
          const profile = state.customerProfiles[email];
          set({ isCustomerAuthenticated: true, currentCustomer: profile });
          return true;
        }
        return false;
      },
      customerSignup: (profile, password) => {
        const state = useStore.getState();
        if (state.customerCredentials[profile.email]) {
          return false; // Email already exists
        }
        const newProfile: CustomerProfile = {
          ...profile,
          id: `CUST-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set({
          customerCredentials: { ...state.customerCredentials, [profile.email]: password },
          customerProfiles: { ...state.customerProfiles, [profile.email]: newProfile },
          isCustomerAuthenticated: true,
          currentCustomer: newProfile,
        });
        return true;
      },
      customerLogout: () => set({ isCustomerAuthenticated: false, currentCustomer: null }),
      setCustomerProfile: (profile) => set({
        isCustomerAuthenticated: true,
        currentCustomer: profile,
        customerProfiles: {
          ...useStore.getState().customerProfiles,
          [profile.email]: profile
        }
      }),
      updateCustomerProfile: (profile) => set((state) => {
        if (!state.currentCustomer) return state;
        const updatedProfile = { ...state.currentCustomer, ...profile };
        return {
          currentCustomer: updatedProfile,
          customerProfiles: {
            ...state.customerProfiles,
            [state.currentCustomer.email]: updatedProfile
          }
        };
      }),
      
      // Customer payment methods
      addPaymentMethod: (method) => set((state) => {
        const newMethod = { ...method, id: `PM-${Date.now()}` };
        return { customerPaymentMethods: [...state.customerPaymentMethods, newMethod] };
      }),

      updatePaymentMethod: (id, method) => set((state) => {
        // When setting as default, unset all others
        if (method.isDefault) {
          return {
            customerPaymentMethods: state.customerPaymentMethods.map(m => 
              m.id === id ? { ...m, ...method, isDefault: true } : { ...m, isDefault: false }
            )
          };
        }
        return {
          customerPaymentMethods: state.customerPaymentMethods.map(m => 
            m.id === id ? { ...m, ...method } : m
          )
        };
      }),

      deletePaymentMethod: (id) => set((state) => ({
        customerPaymentMethods: state.customerPaymentMethods.filter(m => m.id !== id)
      })),
      
      // Customer billing addresses
      addBillingAddress: (address) => set((state) => {
        const newAddress = { ...address, id: `BA-${Date.now()}` };
        return { customerBillingAddresses: [...state.customerBillingAddresses, newAddress] };
      }),

      updateBillingAddress: (id, address) => set((state) => {
        // When setting as default, unset all others
        if (address.isDefault) {
          return {
            customerBillingAddresses: state.customerBillingAddresses.map(a => 
              a.id === id ? { ...a, ...address, isDefault: true } : { ...a, isDefault: false }
            )
          };
        }
        return {
          customerBillingAddresses: state.customerBillingAddresses.map(a => 
            a.id === id ? { ...a, ...address } : a
          )
        };
      }),

      deleteBillingAddress: (id) => set((state) => ({
        customerBillingAddresses: state.customerBillingAddresses.filter(a => a.id !== id)
      })),
      
      // Review actions
      addReview: (review) => set((state) => {
        const newReview: ProductReview = {
          ...review,
          id: `RVW-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        return {
          products: state.products.map(p =>
            p.id === review.productId ? { ...p, customerReviews: [...(p.customerReviews || []), newReview] } : p
          )
        };
      }),

      deleteReview: (reviewId) => set((state) => ({
        products: state.products.map(p => ({
          ...p,
          customerReviews: p.customerReviews?.filter(r => r.id !== reviewId)
        }))
      })),
    }),
    {
      name: 'radha-sarees-store',
    }
  )
);