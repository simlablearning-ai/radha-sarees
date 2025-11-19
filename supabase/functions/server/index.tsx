import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import * as notifications from "./notifications.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Helper to verify user authentication
const verifyUser = async (authHeader: string | null) => {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
};

// Health check endpoint
app.get("/make-server-226dc7f7/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTHENTICATION ====================

// Customer signup
app.post("/make-server-226dc7f7/auth/signup", async (c) => {
  try {
    const { email, password, name, phone, address, city, state, pincode } = await c.req.json();

    if (!email || !password || !name || !phone) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const supabase = getSupabaseClient();
    
    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone, address, city, state, pincode },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store customer profile in KV store
    const profile = {
      id: data.user.id,
      email,
      name,
      phone,
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`customer:${data.user.id}`, profile);

    return c.json({ 
      success: true, 
      user: data.user,
      profile 
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Customer login
app.post("/make-server-226dc7f7/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Login error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Get customer profile from KV store
    const profile = await kv.get(`customer:${data.user.id}`);

    return c.json({ 
      success: true, 
      session: data.session,
      user: data.user,
      profile 
    });
  } catch (error) {
    console.log('Login error:', error);
    return c.json({ error: 'Internal server error during login' }, 500);
  }
});

// Get current session
app.get("/make-server-226dc7f7/auth/session", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`customer:${user.id}`);

    return c.json({ 
      success: true, 
      user,
      profile 
    });
  } catch (error) {
    console.log('Session error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin login (simple)
app.post("/make-server-226dc7f7/auth/admin-login", async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (username === 'admin' && password === 'admin123') {
      return c.json({ success: true });
    }

    return c.json({ error: "Invalid credentials" }, 401);
  } catch (error) {
    console.log('Admin login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== PRODUCTS ====================

// Get all products
app.get("/make-server-226dc7f7/products", async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products: products || [] });
  } catch (error) {
    console.log('Get products error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get single product
app.get("/make-server-226dc7f7/products/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ product });
  } catch (error) {
    console.log('Get product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Add product (admin only)
app.post("/make-server-226dc7f7/products", async (c) => {
  try {
    const product = await c.req.json();
    const id = `${Date.now()}`;
    const newProduct = { ...product, id: parseInt(id) };
    
    await kv.set(`product:${id}`, newProduct);
    
    return c.json({ success: true, product: newProduct });
  } catch (error) {
    console.log('Add product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update product (admin only)
app.put("/make-server-226dc7f7/products/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ error: "Product not found" }, 404);
    }

    const updated = { ...existing, ...updates, id: parseInt(id) };
    await kv.set(`product:${id}`, updated);
    
    return c.json({ success: true, product: updated });
  } catch (error) {
    console.log('Update product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete product (admin only)
app.delete("/make-server-226dc7f7/products/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`product:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete product error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Bulk add products (admin only)
app.post("/make-server-226dc7f7/products/bulk", async (c) => {
  try {
    const { products } = await c.req.json();
    
    const addedProducts = [];
    for (const product of products) {
      const id = `${Date.now()}-${Math.random()}`;
      const newProduct = { ...product, id: parseInt(id.split('-')[0]) };
      await kv.set(`product:${newProduct.id}`, newProduct);
      addedProducts.push(newProduct);
    }
    
    return c.json({ success: true, products: addedProducts });
  } catch (error) {
    console.log('Bulk add products error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== ORDERS ====================

// Get all orders (admin)
app.get("/make-server-226dc7f7/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix('order:');
    return c.json({ orders: orders || [] });
  } catch (error) {
    console.log('Get orders error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get customer orders
app.get("/make-server-226dc7f7/orders/customer/:email", async (c) => {
  try {
    const email = c.req.param('email');
    const allOrders = await kv.getByPrefix('order:');
    const customerOrders = allOrders.filter(order => order.customerEmail === email);
    
    return c.json({ orders: customerOrders });
  } catch (error) {
    console.log('Get customer orders error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create order
app.post("/make-server-226dc7f7/orders", async (c) => {
  try {
    const orderData = await c.req.json();
    const id = `ORD-${Date.now()}`;
    
    const order = {
      ...orderData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`order:${id}`, order);
    
    // Send order placed notification
    try {
      if (order.customerPhone && order.customerName) {
        await notifications.sendOrderPlacedNotification(
          order,
          order.customerPhone,
          order.customerName
        );
      }
    } catch (notifError) {
      console.log('Notification error (non-fatal):', notifError);
      // Don't fail the order creation if notification fails
    }
    
    return c.json({ success: true, order });
  } catch (error) {
    console.log('Create order error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update order (admin only)
app.put("/make-server-226dc7f7/orders/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`order:${id}`);
    if (!existing) {
      return c.json({ error: "Order not found" }, 404);
    }

    const updated = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    await kv.set(`order:${id}`, updated);
    
    // Send status change notification if status has changed
    try {
      if (updates.status && updates.status !== existing.status && updated.customerPhone && updated.customerName) {
        const statusType = updates.status.toLowerCase().replace(' ', '');
        await notifications.sendOrderStatusNotification(
          updated,
          updated.customerPhone,
          updated.customerName,
          updates.status
        );
      }
    } catch (notifError) {
      console.log('Notification error (non-fatal):', notifError);
      // Don't fail the order update if notification fails
    }
    
    return c.json({ success: true, order: updated });
  } catch (error) {
    console.log('Update order error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== CUSTOMER PROFILE ====================

// Get customer profile
app.get("/make-server-226dc7f7/customer/profile", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`customer:${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update customer profile
app.put("/make-server-226dc7f7/customer/profile", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const updates = await c.req.json();
    const existing = await kv.get(`customer:${user.id}`);
    
    const updated = { ...existing, ...updates };
    await kv.set(`customer:${user.id}`, updated);
    
    return c.json({ success: true, profile: updated });
  } catch (error) {
    console.log('Update profile error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== PAYMENT METHODS ====================

// Get payment methods
app.get("/make-server-226dc7f7/customer/payment-methods", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const methods = await kv.getByPrefix(`payment:${user.id}:`);
    return c.json({ methods: methods || [] });
  } catch (error) {
    console.log('Get payment methods error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Add payment method
app.post("/make-server-226dc7f7/customer/payment-methods", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const method = await c.req.json();
    const id = `PM-${Date.now()}`;
    const newMethod = { ...method, id };
    
    await kv.set(`payment:${user.id}:${id}`, newMethod);
    
    return c.json({ success: true, method: newMethod });
  } catch (error) {
    console.log('Add payment method error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update payment method
app.put("/make-server-226dc7f7/customer/payment-methods/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`payment:${user.id}:${id}`);
    if (!existing) {
      return c.json({ error: "Payment method not found" }, 404);
    }

    // If setting as default, unset all others
    if (updates.isDefault) {
      const allMethods = await kv.getByPrefix(`payment:${user.id}:`);
      for (const method of allMethods) {
        if (method.id !== id) {
          await kv.set(`payment:${user.id}:${method.id}`, { ...method, isDefault: false });
        }
      }
    }

    const updated = { ...existing, ...updates };
    await kv.set(`payment:${user.id}:${id}`, updated);
    
    return c.json({ success: true, method: updated });
  } catch (error) {
    console.log('Update payment method error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete payment method
app.delete("/make-server-226dc7f7/customer/payment-methods/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`payment:${user.id}:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete payment method error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== BILLING ADDRESSES ====================

// Get billing addresses
app.get("/make-server-226dc7f7/customer/billing-addresses", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const addresses = await kv.getByPrefix(`billing:${user.id}:`);
    return c.json({ addresses: addresses || [] });
  } catch (error) {
    console.log('Get billing addresses error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Add billing address
app.post("/make-server-226dc7f7/customer/billing-addresses", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const address = await c.req.json();
    const id = `BA-${Date.now()}`;
    const newAddress = { ...address, id };
    
    await kv.set(`billing:${user.id}:${id}`, newAddress);
    
    return c.json({ success: true, address: newAddress });
  } catch (error) {
    console.log('Add billing address error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update billing address
app.put("/make-server-226dc7f7/customer/billing-addresses/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get(`billing:${user.id}:${id}`);
    if (!existing) {
      return c.json({ error: "Billing address not found" }, 404);
    }

    // If setting as default, unset all others
    if (updates.isDefault) {
      const allAddresses = await kv.getByPrefix(`billing:${user.id}:`);
      for (const address of allAddresses) {
        if (address.id !== id) {
          await kv.set(`billing:${user.id}:${address.id}`, { ...address, isDefault: false });
        }
      }
    }

    const updated = { ...existing, ...updates };
    await kv.set(`billing:${user.id}:${id}`, updated);
    
    return c.json({ success: true, address: updated });
  } catch (error) {
    console.log('Update billing address error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete billing address
app.delete("/make-server-226dc7f7/customer/billing-addresses/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param('id');
    await kv.del(`billing:${user.id}:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete billing address error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== SETTINGS ====================

// Get payment gateways
app.get("/make-server-226dc7f7/settings/payment-gateways", async (c) => {
  try {
    const gateways = await kv.get('settings:payment_gateways') || [
      { id: 'razorpay', name: 'Razorpay', enabled: false, apiKey: '', secretKey: '' },
      { id: 'phonepe', name: 'PhonePe', enabled: false, apiKey: '', secretKey: '' },
    ];
    return c.json({ gateways });
  } catch (error) {
    console.log('Get payment gateways error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update payment gateway
app.put("/make-server-226dc7f7/settings/payment-gateways/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    const existing = await kv.get('settings:payment_gateways') || [
      { id: 'razorpay', name: 'Razorpay', enabled: false, apiKey: '', secretKey: '' },
      { id: 'phonepe', name: 'PhonePe', enabled: false, apiKey: '', secretKey: '' },
    ];
    
    const updatedGateways = existing.map((g: any) => 
      g.id === id ? { ...g, ...updates } : g
    );
    
    await kv.set('settings:payment_gateways', updatedGateways);
    
    return c.json({ success: true, gateways: updatedGateways });
  } catch (error) {
    console.log('Update payment gateway error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get site settings
app.get("/make-server-226dc7f7/settings/site", async (c) => {
  try {
    const settings = await kv.get('settings:site') || {
      storeName: 'Radha Sarees',
      storeLogo: '',
      primaryColor: '#75074f',
      secondaryColor: '#C41E3A',
      accentColor: '#FFD700',
    };
    return c.json({ settings });
  } catch (error) {
    console.log('Get site settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update site settings
app.put("/make-server-226dc7f7/settings/site", async (c) => {
  try {
    const updates = await c.req.json();
    const existing = await kv.get('settings:site') || {};
    
    const updated = { ...existing, ...updates };
    await kv.set('settings:site', updated);
    
    return c.json({ success: true, settings: updated });
  } catch (error) {
    console.log('Update site settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get store settings
app.get("/make-server-226dc7f7/settings/store", async (c) => {
  try {
    const settings = await kv.get('settings:store') || {
      storeName: 'Radha Sarees',
      contactEmail: 'info@radhasarees.com',
      contactPhone: '+91 98765 43210',
      storeAddress: '123 Silk Street, Chennai, Tamil Nadu, India',
    };
    return c.json({ settings });
  } catch (error) {
    console.log('Get store settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update store settings
app.put("/make-server-226dc7f7/settings/store", async (c) => {
  try {
    const updates = await c.req.json();
    const existing = await kv.get('settings:store') || {};
    
    const updated = { ...existing, ...updates };
    await kv.set('settings:store', updated);
    
    return c.json({ success: true, settings: updated });
  } catch (error) {
    console.log('Update store settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get shipping settings
app.get("/make-server-226dc7f7/settings/shipping", async (c) => {
  try {
    const settings = await kv.get('settings:shipping') || {
      freeShipping: true,
      minimumOrderForFreeShipping: 999,
      standardShippingCharge: 0,
      estimatedDeliveryTime: '5-7 business days',
    };
    return c.json({ settings });
  } catch (error) {
    console.log('Get shipping settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update shipping settings
app.put("/make-server-226dc7f7/settings/shipping", async (c) => {
  try {
    const updates = await c.req.json();
    const existing = await kv.get('settings:shipping') || {};
    
    const updated = { ...existing, ...updates };
    await kv.set('settings:shipping', updated);
    
    return c.json({ success: true, settings: updated });
  } catch (error) {
    console.log('Update shipping settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== NOTIFICATIONS ====================

// Get notification settings
app.get("/make-server-226dc7f7/settings/notifications", async (c) => {
  try {
    const settings = await kv.get('notification_settings') || {
      smsEnabled: false,
      whatsappEnabled: false,
      provider: 'twilio',
      apiKey: '',
      apiSecret: '',
      senderId: '',
      webhookUrl: '',
      adminPhone: '+91 98765 43210',
      notifyOnNewOrder: true,
      notifyOnStatusChange: true,
      notifyAdminOnOrder: true,
      orderPlacedTemplate: 'Hi {customerName}, your order #{orderId} for ₹{amount} has been placed successfully! We will notify you once it ships.',
      orderShippedTemplate: 'Hi {customerName}, your order #{orderId} has been shipped! Track your order: {trackingUrl}',
      orderDeliveredTemplate: 'Hi {customerName}, your order #{orderId} has been delivered. Thank you for shopping with {storeName}!',
      orderCancelledTemplate: 'Hi {customerName}, your order #{orderId} has been cancelled. Refund will be processed within 5-7 business days.',
      adminOrderTemplate: 'New Order Alert! Order #{orderId} - ₹{amount} from {customerName} ({customerPhone})',
    };
    return c.json({ settings });
  } catch (error) {
    console.log('Get notification settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update notification settings
app.put("/make-server-226dc7f7/settings/notifications", async (c) => {
  try {
    const updates = await c.req.json();
    const existing = await kv.get('notification_settings') || {};
    
    const updated = { ...existing, ...updates };
    await kv.set('notification_settings', updated);
    
    return c.json({ success: true, settings: updated });
  } catch (error) {
    console.log('Update notification settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Test notification
app.post("/make-server-226dc7f7/notifications/test", async (c) => {
  try {
    const { phone, settings } = await c.req.json();
    
    if (!phone) {
      return c.json({ error: 'Phone number is required' }, 400);
    }

    const message = `Test notification from Radha Sarees! This is a test message to verify your SMS/WhatsApp configuration. Timestamp: ${new Date().toISOString()}`;
    
    const smsSuccess = settings.smsEnabled 
      ? await notifications.sendNotification(phone, message, settings, 'sms')
      : false;
    
    const whatsappSuccess = settings.whatsappEnabled 
      ? await notifications.sendNotification(phone, message, settings, 'whatsapp')
      : false;

    if (smsSuccess || whatsappSuccess) {
      return c.json({ 
        success: true, 
        message: 'Test notification sent successfully',
        smsSuccess,
        whatsappSuccess 
      });
    } else {
      return c.json({ 
        error: 'Failed to send test notification. Please check your settings and credentials.' 
      }, 500);
    }
  } catch (error) {
    console.log('Test notification error:', error);
    return c.json({ error: `Test notification failed: ${error.message}` }, 500);
  }
});

// Send order notification
app.post("/make-server-226dc7f7/notifications/order", async (c) => {
  try {
    const { orderId, phone, type } = await c.req.json();
    
    if (!orderId || !phone || !type) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const customerName = order.customerName || 'Customer';
    
    if (type === 'placed') {
      await notifications.sendOrderPlacedNotification(order, phone, customerName);
    } else if (['shipped', 'delivered', 'cancelled'].includes(type)) {
      const statusMap = {
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
      };
      await notifications.sendOrderStatusNotification(
        order, 
        phone, 
        customerName, 
        statusMap[type]
      );
    } else {
      return c.json({ error: 'Invalid notification type' }, 400);
    }

    return c.json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.log('Send order notification error:', error);
    return c.json({ error: `Failed to send notification: ${error.message}` }, 500);
  }
});

// ==================== REPORTS ====================

// Generate report
app.post("/make-server-226dc7f7/reports", async (c) => {
  try {
    const reportData = await c.req.json();
    const id = `RPT-${Date.now()}`;
    
    const report = {
      ...reportData,
      id,
      generatedAt: new Date().toISOString(),
    };
    
    await kv.set(`report:${id}`, report);
    
    return c.json({ success: true, report });
  } catch (error) {
    console.log('Generate report error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all reports
app.get("/make-server-226dc7f7/reports", async (c) => {
  try {
    const reports = await kv.getByPrefix('report:');
    return c.json({ reports: reports || [] });
  } catch (error) {
    console.log('Get reports error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete report
app.delete("/make-server-226dc7f7/reports/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`report:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete report error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);