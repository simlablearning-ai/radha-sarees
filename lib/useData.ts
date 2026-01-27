import { useEffect, useState } from 'react';
import { useStore } from './store';
import { api } from './api';
import { toast } from 'sonner';

export function useDataSync() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    isCustomerAuthenticated,
    currentCustomer,
  } = useStore();

  // Load customer-specific data when authenticated
  const loadCustomerData = async () => {
    try {
      const [paymentMethodsData, billingAddressesData] = await Promise.all([
        api.getPaymentMethods().catch(() => ({ methods: [] })),
        api.getBillingAddresses().catch(() => ({ addresses: [] })),
      ]);
      
      if (paymentMethodsData.methods) {
        useStore.setState({ customerPaymentMethods: paymentMethodsData.methods });
      }
      
      if (billingAddressesData.addresses) {
        useStore.setState({ customerBillingAddresses: billingAddressesData.addresses });
      }
    } catch (error) {
      console.error('Failed to load customer data:', error);
    }
  };

  // Initialize: Load data from server on mount
  useEffect(() => {
    if (isInitialized) return;
    
    const initializeData = async () => {
      try {
        setIsLoading(true);
        console.log('Starting data initialization...');
        
        // Helper to safely fetch data without throwing
        async function safeFetch<T>(fetcher: () => Promise<T>, fallbackName: string): Promise<T | null> {
          try {
            return await fetcher();
          } catch (error) {
            console.warn(`Failed to load ${fallbackName} from server:`, error);
            return null;
          }
        }
        
        // Load products
        const productsData = await safeFetch<{products: any[]}>(() => api.getProducts(), 'products');
        if (productsData?.products) {
          useStore.setState({ products: productsData.products });
        }
        
        // Load orders
        const ordersData = await safeFetch<{orders: any[]}>(() => api.getOrders(), 'orders');
        if (ordersData?.orders) {
          useStore.setState({ orders: ordersData.orders });
        }
        
        // Load settings
        const settingsData = await safeFetch<{settings: any}>(() => api.getSiteSettings(), 'settings');
        if (settingsData?.settings) {
          useStore.setState({ siteSettings: settingsData.settings });
        }
        
        const gatewaysData = await safeFetch<{gateways: any[]}>(() => api.getPaymentGateways(), 'payment gateways');
        if (gatewaysData?.gateways) {
          useStore.setState({ paymentGateways: gatewaysData.gateways });
        }
        
        const reportsData = await safeFetch<{reports: any[]}>(() => api.getReports(), 'reports');
        if (reportsData?.reports) {
          useStore.setState({ reports: reportsData.reports });
        }
        
        // Check for existing session
        const token = api.getToken();
        console.log('Checking for existing session token:', !!token);
        if (token) {
          try {
            // We can't easily wrap this in safeFetch because it has specific logic
            // But we can wrap the inner call
            const sessionData = await api.getSession().catch(() => null);
            console.log('Session data:', sessionData);
            if (sessionData?.profile) {
              useStore.setState({
                isCustomerAuthenticated: true,
                currentCustomer: sessionData.profile,
              });
              
              // Load customer-specific data
              await loadCustomerData();
            } else if (!sessionData) {
               // Token might be invalid or server down
               console.warn('Session check failed or server unreachable');
            }
          } catch (error) {
            console.error('Session validation failed:', error);
            // Session expired, clear token
            api.logout();
          }
        }
        
        console.log('Data initialization complete!');
      } catch (error) {
        console.error('Unexpected error during initialization:', error);
        if (error instanceof Error && error.message !== 'Failed to fetch') {
             toast.error('Failed to initialize application data');
        }
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeData();
  }, [isInitialized]);

  // Sync customer data when authentication state changes
  useEffect(() => {
    if (isCustomerAuthenticated && currentCustomer) {
      loadCustomerData();
    } else {
      useStore.setState({ 
        customerPaymentMethods: [],
        customerBillingAddresses: []
      });
    }
  }, [isCustomerAuthenticated]);

  return { isLoading, isInitialized };
}

// Enhanced store actions with API integration
export const syncedActions = {
  // Products
  addProduct: async (product: any) => {
    try {
      // Ensure inStock is calculated from stock
      const productWithStock = {
        ...product,
        inStock: product.stock > 0
      };
      const result = await api.addProduct(productWithStock);
      if (result.product) {
        useStore.getState().addProduct(result.product);
        return true; // Return true on success
      }
      return false;
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product');
      return false; // Return false on error
    }
  },

  updateProduct: async (id: number, product: any) => {
    try {
      // Ensure inStock is calculated from stock
      const productWithStock = {
        ...product,
        inStock: product.stock > 0
      };
      const result = await api.updateProduct(id, productWithStock);
      if (result.product) {
        useStore.getState().updateProduct(id, result.product);
      }
      return result;
    } catch (error) {
      console.error('Failed to update product:', error);
      toast.error('Failed to update product');
      throw error;
    }
  },

  deleteProduct: async (id: number) => {
    try {
      await api.deleteProduct(id);
      useStore.getState().deleteProduct(id);
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
      throw error;
    }
  },

  bulkAddProducts: async (products: any[]) => {
    try {
      const result = await api.bulkAddProducts(products);
      if (result.products) {
        useStore.getState().bulkAddProducts(result.products);
      }
      return result;
    } catch (error) {
      console.error('Failed to bulk add products:', error);
      toast.error('Failed to add products');
      throw error;
    }
  },

  // Orders
  addOrder: async (order: any) => {
    try {
      const result = await api.createOrder(order);
      if (result.order) {
        useStore.getState().addOrder(result.order);
      }
      return result;
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order');
      throw error;
    }
  },

  updateOrder: async (id: string, order: any) => {
    try {
      const result = await api.updateOrder(id, order);
      if (result.order) {
        useStore.getState().updateOrder(id, result.order);
      }
      return result;
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order');
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: any) => {
    try {
      const result = await api.updateOrder(id, { status });
      if (result.order) {
        useStore.getState().updateOrderStatus(id, status);
      }
      return result;
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
      throw error;
    }
  },

  // Customer Auth
  customerLogin: async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      console.log('Login API response:', result);
      
      // Check for profile in the response
      if (result && result.profile) {
        console.log('Setting customer profile:', result.profile);
        useStore.setState({
          isCustomerAuthenticated: true,
          currentCustomer: result.profile,
        });
        toast.success('Login successful!');
        return true;
      } else {
        console.error('No profile in login response:', result);
        toast.error('Login failed: No profile data');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return false;
    }
  },

  customerSignup: async (profile: any, password: string) => {
    try {
      const result = await api.signup({ ...profile, password });
      console.log('Signup API response:', result);
      
      // Check for profile in the response (after auto-login)
      if (result && result.profile) {
        console.log('Setting customer profile:', result.profile);
        useStore.setState({
          isCustomerAuthenticated: true,
          currentCustomer: result.profile,
        });
        toast.success('Account created successfully!');
        return true;
      } else {
        console.error('No profile in signup response:', result);
        toast.error('Signup failed: No profile data');
        return false;
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed');
      return false;
    }
  },

  customerLogout: () => {
    api.logout();
    useStore.setState({
      isCustomerAuthenticated: false,
      currentCustomer: null,
      customerPaymentMethods: [],
      customerBillingAddresses: [],
    });
  },

  setCustomerProfile: (profile: any) => {
    useStore.getState().setCustomerProfile(profile);
  },

  updateCustomerProfile: async (profile: any) => {
    try {
      const result = await api.updateProfile(profile);
      if (result.profile) {
        useStore.getState().updateCustomerProfile(result.profile);
      }
      return result;
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  },

  // Payment Methods
  addPaymentMethod: async (method: any) => {
    try {
      const result = await api.addPaymentMethod(method);
      if (result.method) {
        useStore.getState().addPaymentMethod(result.method);
      }
      return result;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method');
      throw error;
    }
  },

  updatePaymentMethod: async (id: string, method: any) => {
    try {
      const result = await api.updatePaymentMethod(id, method);
      if (result.method) {
        useStore.getState().updatePaymentMethod(id, result.method);
      }
      return result;
    } catch (error) {
      console.error('Failed to update payment method:', error);
      toast.error('Failed to update payment method');
      throw error;
    }
  },

  deletePaymentMethod: async (id: string) => {
    try {
      await api.deletePaymentMethod(id);
      useStore.getState().deletePaymentMethod(id);
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      toast.error('Failed to delete payment method');
      throw error;
    }
  },

  // Billing Addresses
  addBillingAddress: async (address: any) => {
    try {
      const result = await api.addBillingAddress(address);
      if (result.address) {
        useStore.getState().addBillingAddress(result.address);
      }
      return result;
    } catch (error) {
      console.error('Failed to add billing address:', error);
      toast.error('Failed to add billing address');
      throw error;
    }
  },

  updateBillingAddress: async (id: string, address: any) => {
    try {
      const result = await api.updateBillingAddress(id, address);
      if (result.address) {
        useStore.getState().updateBillingAddress(id, result.address);
      }
      return result;
    } catch (error) {
      console.error('Failed to update billing address:', error);
      toast.error('Failed to update billing address');
      throw error;
    }
  },

  deleteBillingAddress: async (id: string) => {
    try {
      await api.deleteBillingAddress(id);
      useStore.getState().deleteBillingAddress(id);
    } catch (error) {
      console.error('Failed to delete billing address:', error);
      toast.error('Failed to delete billing address');
      throw error;
    }
  },

  // Settings
  updateSiteSettings: async (settings: any) => {
    try {
      const result = await api.updateSiteSettings(settings);
      if (result.settings) {
        useStore.getState().updateSiteSettings(result.settings);
      }
      return true; // Return true on success
    } catch (error) {
      console.error('Failed to update site settings:', error);
      toast.error(`Failed to update settings: ${error.message || 'Unknown error'}`);
      return false; // Return false on error
    }
  },

  updatePaymentGateway: async (id: string, gateway: any) => {
    try {
      const result = await api.updatePaymentGateway(id, gateway);
      if (result.gateways) {
        useStore.setState({ paymentGateways: result.gateways });
      }
      return result;
    } catch (error) {
      console.error('Failed to update payment gateway:', error);
      toast.error('Failed to update payment gateway');
      throw error;
    }
  },

  // Reports
  generateReport: async (report: any) => {
    try {
      const result = await api.generateReport(report);
      if (result.report) {
        useStore.getState().generateReport(result.report);
      }
      return result;
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
      throw error;
    }
  },

  deleteReport: async (id: string) => {
    try {
      await api.deleteReport(id);
      useStore.getState().deleteReport(id);
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report');
      throw error;
    }
  },

  // Admin login
  adminLogin: async (username: string, password: string) => {
    try {
      const result = await api.adminLogin(username, password);
      if (result.success) {
        useStore.setState({
          isAdminAuthenticated: true,
          adminUsername: username,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to admin login:', error);
      return false;
    }
  },

  adminLogout: () => {
    useStore.setState({
      isAdminAuthenticated: false,
      adminUsername: null,
    });
  },
};