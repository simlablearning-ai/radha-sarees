import { useState } from "react";
import { useStore } from "../../lib/store";
import { api } from "../../lib/api";
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
    whatsappEnabled: false,
    provider: 'twilio', // twilio, msg91, textlocal, custom
    apiKey: '',
    apiSecret: '',
    senderId: '',
    webhookUrl: '',
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

  const handleSaveRazorpay = () => {
    updatePaymentGateway('razorpay', {
      enabled: razorpaySettings.enabled,
      apiKey: razorpaySettings.apiKey,
      secretKey: razorpaySettings.secretKey,
    });
    toast.success("Razorpay settings saved!");
  };

  const handleSavePhonePe = () => {
    updatePaymentGateway('phonepe', {
      enabled: phonePeSettings.enabled,
      apiKey: phonePeSettings.apiKey,
      secretKey: phonePeSettings.secretKey,
    });
    toast.success("PhonePe settings saved!");
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
      await api.testNotification(testPhone, notificationSettings);
      toast.success("Test notification sent successfully!");
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error("Failed to send test notification");
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
                SMS & WhatsApp Notifications
              </CardTitle>
              <CardDescription>
                Configure SMS and WhatsApp notifications for orders and status updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Selection Guides */}
              <div className="p-4 rounded-lg bg-muted border border-border space-y-3">
                <p className="text-foreground">
                  <strong>Supported Providers:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    <strong>Twilio:</strong> Enterprise-grade SMS & WhatsApp API (Global)
                    <br />
                    <a 
                      href="https://www.twilio.com/docs/sms" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-6"
                    >
                      Get API credentials →
                    </a>
                  </li>
                  <li>
                    <strong>MSG91:</strong> Popular Indian SMS provider with competitive rates
                    <br />
                    <a 
                      href="https://msg91.com/help/MSG91/how-to-get-msg91-authkey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-6"
                    >
                      Get API credentials →
                    </a>
                  </li>
                  <li>
                    <strong>Textlocal:</strong> Affordable Indian SMS gateway
                    <br />
                    <a 
                      href="https://www.textlocal.in/api-keys/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-6"
                    >
                      Get API credentials →
                    </a>
                  </li>
                  <li>
                    <strong>Custom:</strong> Use your own webhook endpoint
                  </li>
                </ul>
              </div>

              {/* Enable Toggles */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                <div>
                  <Label className="text-foreground">SMS Notifications</Label>
                  <p className="text-muted-foreground">
                    Send SMS to customers and admin
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.smsEnabled}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, smsEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
                <div>
                  <Label className="text-foreground">WhatsApp Notifications</Label>
                  <p className="text-muted-foreground">
                    Send WhatsApp messages (requires Twilio Business API)
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.whatsappEnabled}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({ ...notificationSettings, whatsappEnabled: checked })
                  }
                />
              </div>

              {/* Provider Configuration */}
              <div className="space-y-4">
                <Label className="text-foreground">Provider</Label>
                <Select
                  value={notificationSettings.provider}
                  onValueChange={(value) =>
                    setNotificationSettings({ ...notificationSettings, provider: value })
                  }
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="msg91">MSG91</SelectItem>
                    <SelectItem value="textlocal">Textlocal</SelectItem>
                    <SelectItem value="custom">Custom Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>API Key</Label>
                <Input
                  type="text"
                  placeholder="API Key"
                  value={notificationSettings.apiKey}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, apiKey: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>API Secret</Label>
                <Input
                  type="password"
                  placeholder="API Secret"
                  value={notificationSettings.apiSecret}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, apiSecret: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Sender ID</Label>
                <Input
                  type="text"
                  placeholder="Sender ID"
                  value={notificationSettings.senderId}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, senderId: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Webhook URL</Label>
                <Input
                  type="text"
                  placeholder="Webhook URL"
                  value={notificationSettings.webhookUrl}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, webhookUrl: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Admin Phone</Label>
                <Input
                  type="tel"
                  placeholder="Admin Phone"
                  value={notificationSettings.adminPhone}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, adminPhone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Notifications</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationSettings.notifyOnNewOrder}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, notifyOnNewOrder: checked })
                    }
                  />
                  <Label>Notify on New Order</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationSettings.notifyOnStatusChange}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, notifyOnStatusChange: checked })
                    }
                  />
                  <Label>Notify on Status Change</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={notificationSettings.notifyAdminOnOrder}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, notifyAdminOnOrder: checked })
                    }
                  />
                  <Label>Notify Admin on Order</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Message Templates</Label>
                <div>
                  <Label>Order Placed Template</Label>
                  <Textarea
                    value={notificationSettings.orderPlacedTemplate}
                    onChange={(e) =>
                      setNotificationSettings({ ...notificationSettings, orderPlacedTemplate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Order Shipped Template</Label>
                  <Textarea
                    value={notificationSettings.orderShippedTemplate}
                    onChange={(e) =>
                      setNotificationSettings({ ...notificationSettings, orderShippedTemplate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Order Delivered Template</Label>
                  <Textarea
                    value={notificationSettings.orderDeliveredTemplate}
                    onChange={(e) =>
                      setNotificationSettings({ ...notificationSettings, orderDeliveredTemplate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Order Cancelled Template</Label>
                  <Textarea
                    value={notificationSettings.orderCancelledTemplate}
                    onChange={(e) =>
                      setNotificationSettings({ ...notificationSettings, orderCancelledTemplate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Admin Order Template</Label>
                  <Textarea
                    value={notificationSettings.adminOrderTemplate}
                    onChange={(e) =>
                      setNotificationSettings({ ...notificationSettings, adminOrderTemplate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Test Notification</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="tel"
                    placeholder="Test Phone Number"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                  <Button
                    onClick={handleTestNotification}
                    disabled={isTesting}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isTesting ? 'Sending...' : 'Send Test Notification'}
                  </Button>
                </div>
              </div>
              <Button onClick={handleSaveNotificationSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}