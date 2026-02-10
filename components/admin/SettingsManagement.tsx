import { useState, useEffect } from "react";
import { useStore } from "../../lib/store";
import { api } from "../../lib/api";
import { syncedActions } from "../../lib/useData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CreditCard, Save, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { SiteSettings } from "./SiteSettings";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function SettingsManagement() {
  const { paymentGateways, updatePaymentGateway } = useStore();
  
  const [razorpaySettings, setRazorpaySettings] = useState({
    enabled: paymentGateways.find(g => g.id === 'razorpay')?.enabled || false,
    apiKey: paymentGateways.find(g => g.id === 'razorpay')?.apiKey || '',
    secretKey: paymentGateways.find(g => g.id === 'razorpay')?.secretKey || '',
  });

  const [phonePeSettings, setPhonePeSettings] = useState({
    enabled: paymentGateways.find(g => g.id === 'phonepe')?.enabled || false,
    apiKey: paymentGateways.find(g => g.id === 'phonepe')?.apiKey || '',
    secretKey: paymentGateways.find(g => g.id === 'phonepe')?.secretKey || '',
  });

  // Sync local state with store when data is loaded from server
  useEffect(() => {
    const razorpay = paymentGateways.find(g => g.id === 'razorpay');
    if (razorpay) {
      setRazorpaySettings(prev => ({
        ...prev,
        enabled: razorpay.enabled,
        apiKey: razorpay.apiKey || prev.apiKey || '', // Prefer store, fallback to local (user input)
        secretKey: razorpay.secretKey || prev.secretKey || '',
      }));
    }

    const phonepe = paymentGateways.find(g => g.id === 'phonepe');
    if (phonepe) {
      setPhonePeSettings(prev => ({
        ...prev,
        enabled: phonepe.enabled,
        apiKey: phonepe.apiKey || prev.apiKey || '',
        secretKey: phonepe.secretKey || prev.secretKey || '',
      }));
    }
  }, [paymentGateways]);

  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Radha Sarees',
    contactEmail: 'info@radhasarees.com',
    contactPhone: '+91 98765 43210',
    storeAddress: '123 Silk Street, Chennai, Tamil Nadu, India',
  });

  const [shippingSettings, setShippingSettings] = useState({
    freeShipping: true,
    minimumOrderForFreeShipping: 999,
    standardShippingCharge: 0,
    estimatedDeliveryTime: '5-7 business days',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    smsEnabled: false,
    apiKey: '',
    route: 'promotional' as 'transactional' | 'promotional',
    adminPhone: '+91 98765 43210',
    // Notification toggles
    notifyOnNewOrder: true,
    notifyOnStatusChange: true,
    notifyAdminOnOrder: true,
    // Message templates
    orderPlacedTemplate: 'Hi {customerName}, your order #{orderId} for ₹{amount} has been placed successfully! We will notify you once it ships.',
    orderShippedTemplate: 'Hi {customerName}, your order #{orderId} has been shipped! Track your order: {trackingUrl}',
    orderDeliveredTemplate: 'Hi {customerName}, your order #{orderId} has been delivered. Thank you for shopping with {storeName}!',
    orderCancelledTemplate: 'Hi {customerName}, your order #{orderId} has been cancelled. Refund will be processed within 5-7 business days.',
    adminOrderTemplate: 'New Order Alert! Order #{orderId} - ₹{amount} from {customerName} ({customerPhone})',
  });

  const [testPhone, setTestPhone] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Load notification settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await api.getNotificationSettings();
        if (response.settings) {
          setNotificationSettings(response.settings);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveRazorpay = async () => {
    try {
      await syncedActions.updatePaymentGateway('razorpay', {
        enabled: razorpaySettings.enabled,
        apiKey: razorpaySettings.apiKey,
        secretKey: razorpaySettings.secretKey,
      });
      toast.success("Razorpay settings saved!");
    } catch (error) {
      // Error handled by syncedActions
    }
  };

  const handleSavePhonePe = async () => {
    try {
      await syncedActions.updatePaymentGateway('phonepe', {
        enabled: phonePeSettings.enabled,
        apiKey: phonePeSettings.apiKey,
        secretKey: phonePeSettings.secretKey,
      });
      toast.success("PhonePe settings saved!");
    } catch (error) {
      // Error handled by syncedActions
    }
  };

  const handleSaveStoreSettings = async () => {
    try {
      await api.updateStoreSettings(storeSettings);
      toast.success("Store settings saved successfully!");
    } catch (error) {
      console.error('Error saving store settings:', error);
      toast.error("Failed to save store settings");
    }
  };

  const handleSaveShippingSettings = async () => {
    try {
      await api.updateShippingSettings(shippingSettings);
      toast.success("Shipping settings saved successfully!");
    } catch (error) {
      console.error('Error saving shipping settings:', error);
      toast.error("Failed to save shipping settings");
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      await api.updateNotificationSettings(notificationSettings);
      toast.success("Notification settings saved successfully!");
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error("Failed to save notification settings");
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      // Create a temporary settings object that enables SMS for the test
      // This allows testing even if the main switch is off
      const testSettings = { ...notificationSettings, smsEnabled: true };
      
      const response = await api.testNotification(testPhone, testSettings);
      
      // The backend now returns success: false with an error message in the body
      // We need to check for that
      if (response && response.success === false) {
        throw new Error(response.error || "Failed to send test notification");
      }
      
      toast.success("Test notification sent successfully!");
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      toast.error(error.message || "Failed to send test notification");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="site" className="w-full">
        <TabsList>
          <TabsTrigger value="site">Site Settings</TabsTrigger>
          <TabsTrigger value="payment">Payment Gateways</TabsTrigger>
          <TabsTrigger value="store">Store Settings</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="site" className="space-y-6">
          <SiteSettings />
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          {/* Razorpay */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Razorpay</CardTitle>
                  <CardDescription>Configure Razorpay payment gateway</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={razorpaySettings.enabled}
                    onCheckedChange={(checked) =>
                      setRazorpaySettings({ ...razorpaySettings, enabled: checked })
                    }
                  />
                  <Label>{razorpaySettings.enabled ? 'Enabled' : 'Disabled'}</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>API Key</Label>
                <Input
                  type="text"
                  placeholder="rzp_test_xxxxxxxxxx"
                  value={razorpaySettings.apiKey}
                  onChange={(e) =>
                    setRazorpaySettings({ ...razorpaySettings, apiKey: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={razorpaySettings.secretKey}
                  onChange={(e) =>
                    setRazorpaySettings({ ...razorpaySettings, secretKey: e.target.value })
                  }
                />
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <p className="text-muted-foreground mb-2">How to get API credentials:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Sign in to your Razorpay Dashboard</li>
                  <li>Go to Settings → API Keys</li>
                  <li>Generate new API keys or use existing ones</li>
                  <li>Copy and paste the Key ID and Secret here</li>
                </ol>
              </div>

              <Button onClick={handleSaveRazorpay} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Razorpay Settings
              </Button>
            </CardContent>
          </Card>

          {/* PhonePe */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>PhonePe</CardTitle>
                  <CardDescription>Configure PhonePe payment gateway</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={phonePeSettings.enabled}
                    onCheckedChange={(checked) =>
                      setPhonePeSettings({ ...phonePeSettings, enabled: checked })
                    }
                  />
                  <Label>{phonePeSettings.enabled ? 'Enabled' : 'Disabled'}</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Merchant ID</Label>
                <Input
                  type="text"
                  placeholder="MERCHANTUAT"
                  value={phonePeSettings.apiKey}
                  onChange={(e) =>
                    setPhonePeSettings({ ...phonePeSettings, apiKey: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Salt Key</Label>
                <Input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={phonePeSettings.secretKey}
                  onChange={(e) =>
                    setPhonePeSettings({ ...phonePeSettings, secretKey: e.target.value })
                  }
                />
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <p className="text-muted-foreground mb-2">How to get API credentials:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Register on PhonePe Business Portal</li>
                  <li>Complete KYC verification</li>
                  <li>Navigate to Settings → API Credentials</li>
                  <li>Copy Merchant ID and Salt Key</li>
                </ol>
              </div>

              <Button onClick={handleSavePhonePe} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save PhonePe Settings
              </Button>
            </CardContent>
          </Card>

          {/* Payment Gateway Status */}
          <Card>
            <CardHeader>
              <CardTitle>Active Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentGateways.map((gateway) => (
                  <div
                    key={gateway.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-foreground">{gateway.name}</p>
                        <p className="text-muted-foreground">
                          {gateway.enabled ? 'Accepting payments' : 'Not configured'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full ${
                        gateway.enabled
                          ? 'bg-chart-3/20 text-chart-3'
                          : 'bg-muted-foreground/20 text-muted-foreground'
                      }`}
                    >
                      {gateway.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-foreground">Cash on Delivery</p>
                      <p className="text-muted-foreground">Always available</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-chart-3/20 text-chart-3">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Manage your store details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Store Name</Label>
                <Input
                  defaultValue="Radha Sarees"
                  value={storeSettings.storeName}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, storeName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  defaultValue="info@radhasarees.com"
                  value={storeSettings.contactEmail}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, contactEmail: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  value={storeSettings.contactPhone}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, contactPhone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Store Address</Label>
                <Input
                  defaultValue="123 Silk Street, Chennai, Tamil Nadu, India"
                  value={storeSettings.storeAddress}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, storeAddress: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSaveStoreSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Store Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Settings</CardTitle>
              <CardDescription>Configure shipping options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Free Shipping</Label>
                  <p className="text-muted-foreground">
                    Offer free shipping on all orders
                  </p>
                </div>
                <Switch
                  defaultChecked={shippingSettings.freeShipping}
                  onCheckedChange={(checked) =>
                    setShippingSettings({ ...shippingSettings, freeShipping: checked })
                  }
                />
              </div>
              <div>
                <Label>Minimum Order for Free Shipping (₹)</Label>
                <Input
                  type="number"
                  defaultValue="999"
                  value={shippingSettings.minimumOrderForFreeShipping}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      minimumOrderForFreeShipping: parseInt(e.target.value, 10),
                    })
                  }
                />
              </div>
              <div>
                <Label>Standard Shipping Charge (₹)</Label>
                <Input
                  type="number"
                  defaultValue="0"
                  value={shippingSettings.standardShippingCharge}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      standardShippingCharge: parseInt(e.target.value, 10),
                    })
                  }
                />
              </div>
              <div>
                <Label>Estimated Delivery Time (days)</Label>
                <Input
                  defaultValue="5-7 business days"
                  value={shippingSettings.estimatedDeliveryTime}
                  onChange={(e) =>
                    setShippingSettings({ ...shippingSettings, estimatedDeliveryTime: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSaveShippingSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Shipping Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Fast2SMS Notifications
              </CardTitle>
              <CardDescription>
                Configure Fast2SMS for order notifications and status updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading settings...
                </div>
              ) : (
                <>
                  {/* Fast2SMS Setup Guide */}
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
                    <p className="text-foreground">
                      <strong>📱 Fast2SMS Setup Guide:</strong>
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Sign up at <a href="https://www.fast2sms.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Fast2SMS.com</a></li>
                      <li>Complete KYC verification to activate your account</li>
                      <li>Navigate to <strong>Dev API</strong> tab in dashboard</li>
                      <li>Copy your <strong>API Key</strong> (authorization key)</li>
                      <li>Set up the webhook URL in Fast2SMS dashboard (optional for delivery reports):
                        <div className="mt-2 p-2 bg-background/50 rounded border border-border">
                          <code className="text-xs break-all">https://idlwcefmmisueqvzwlrf.supabase.co/functions/v1/make-server-226dc7f7/sms-webhook</code>
                        </div>
                      </li>
                    </ol>
                    <div className="p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-muted-foreground">
                        💡 <strong>Pro tips:</strong>
                      </p>
                      <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-1">
                        <li><strong>Promotional route</strong> - Lower cost, no DLT registration needed for testing</li>
                        <li><strong>Transactional route</strong> - Higher reliability, requires DLT registration for production</li>
                        <li>Start with promotional route for testing, switch to transactional for production</li>
                      </ul>
                    </div>
                  </div>

                  {/* Enable SMS */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                    <div>
                      <Label className="text-foreground">Enable SMS Notifications</Label>
                      <p className="text-muted-foreground">
                        Send SMS to customers and admin for orders
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsEnabled}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, smsEnabled: checked })
                      }
                    />
                  </div>

                  {/* API Key */}
                  <div>
                    <Label>Fast2SMS API Key (Authorization Key)</Label>
                    <Input
                      type="text"
                      placeholder="Paste your Fast2SMS API Key here"
                      value={notificationSettings.apiKey}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, apiKey: e.target.value })
                      }
                    />
                    <p className="text-muted-foreground mt-1">
                      Get this from Fast2SMS Dashboard → Dev API → Authorization
                    </p>
                  </div>

                  {/* Route Selection */}
                  <div>
                    <Label>SMS Route</Label>
                    <Select
                      value={notificationSettings.route}
                      onValueChange={(value: 'transactional' | 'promotional') =>
                        setNotificationSettings({ ...notificationSettings, route: value })
                      }
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotional">Promotional (Testing/Lower Cost)</SelectItem>
                        <SelectItem value="transactional">Transactional (Production/DLT Required)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground mt-1">
                      {notificationSettings.route === 'promotional' 
                        ? '💰 Promotional: Best for testing, lower cost, no DLT needed'
                        : '✅ Transactional: Production-ready, requires DLT registration'
                      }
                    </p>
                  </div>

                  {/* Admin Phone */}
                  <div>
                    <Label>Admin Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={notificationSettings.adminPhone}
                      onChange={(e) =>
                        setNotificationSettings({ ...notificationSettings, adminPhone: e.target.value })
                      }
                    />
                    <p className="text-muted-foreground mt-1">
                      Receive order notifications on this number (with country code)
                    </p>
                  </div>

                  {/* Notification Toggles */}
                  <div className="space-y-3">
                    <Label>Notification Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                        <Switch
                          checked={notificationSettings.notifyOnNewOrder}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, notifyOnNewOrder: checked })
                          }
                        />
                        <Label>Notify customer on new order placement</Label>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                        <Switch
                          checked={notificationSettings.notifyOnStatusChange}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, notifyOnStatusChange: checked })
                          }
                        />
                        <Label>Notify customer on order status changes</Label>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                        <Switch
                          checked={notificationSettings.notifyAdminOnOrder}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, notifyAdminOnOrder: checked })
                          }
                        />
                        <Label>Notify admin when new orders are placed</Label>
                      </div>
                    </div>
                  </div>

                  {/* Message Templates */}
                  <div className="space-y-4">
                    <Label>Message Templates</Label>
                    <p className="text-muted-foreground">
                      Use variables: {'{customerName}'}, {'{orderId}'}, {'{amount}'}, {'{storeName}'}, {'{trackingUrl}'}
                    </p>
                    
                    <div>
                      <Label>Order Placed Template</Label>
                      <Textarea
                        placeholder="Hi {customerName}, your order #{orderId} has been placed!"
                        value={notificationSettings.orderPlacedTemplate}
                        onChange={(e) =>
                          setNotificationSettings({ ...notificationSettings, orderPlacedTemplate: e.target.value })
                        }
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div>
                      <Label>Order Shipped Template</Label>
                      <Textarea
                        placeholder="Hi {customerName}, your order #{orderId} has been shipped!"
                        value={notificationSettings.orderShippedTemplate}
                        onChange={(e) =>
                          setNotificationSettings({ ...notificationSettings, orderShippedTemplate: e.target.value })
                        }
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div>
                      <Label>Order Delivered Template</Label>
                      <Textarea
                        placeholder="Hi {customerName}, your order #{orderId} has been delivered!"
                        value={notificationSettings.orderDeliveredTemplate}
                        onChange={(e) =>
                          setNotificationSettings({ ...notificationSettings, orderDeliveredTemplate: e.target.value })
                        }
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div>
                      <Label>Order Cancelled Template</Label>
                      <Textarea
                        placeholder="Hi {customerName}, your order #{orderId} has been cancelled."
                        value={notificationSettings.orderCancelledTemplate}
                        onChange={(e) =>
                          setNotificationSettings({ ...notificationSettings, orderCancelledTemplate: e.target.value })
                        }
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div>
                      <Label>Admin Order Notification Template</Label>
                      <Textarea
                        placeholder="New Order! #{orderId} - ₹{amount} from {customerName}"
                        value={notificationSettings.adminOrderTemplate}
                        onChange={(e) =>
                          setNotificationSettings({ ...notificationSettings, adminOrderTemplate: e.target.value })
                        }
                        className="min-h-[80px]"
                      />
                      <p className="text-muted-foreground mt-1">
                        Additional variable: {'{customerPhone}'}
                      </p>
                    </div>
                  </div>

                  {/* Test Notification */}
                  <div className="space-y-2 p-4 rounded-lg bg-muted border border-border">
                    <Label>Test Notification</Label>
                    <p className="text-muted-foreground mb-3">
                      Send a test SMS to verify your configuration
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleTestNotification}
                        disabled={isTesting || !testPhone || !notificationSettings.apiKey}
                        variant="outline"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isTesting ? 'Sending...' : 'Send Test'}
                      </Button>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button onClick={handleSaveNotificationSettings} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}