import { useState } from "react";
import { useStore } from "../../lib/store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { CreditCard, Save } from "lucide-react";
import { toast } from "sonner";
import { SiteSettings } from "./SiteSettings";

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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="site" className="w-full">
        <TabsList>
          <TabsTrigger value="site">Site Settings</TabsTrigger>
          <TabsTrigger value="payment">Payment Gateways</TabsTrigger>
          <TabsTrigger value="store">Store Settings</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
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
                <Input defaultValue="Radha Sarees" />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input type="email" defaultValue="info@radhasarees.com" />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input type="tel" defaultValue="+91 98765 43210" />
              </div>
              <div>
                <Label>Store Address</Label>
                <Input defaultValue="123 Silk Street, Chennai, Tamil Nadu, India" />
              </div>
              <Button className="w-full">
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
                <Switch defaultChecked />
              </div>
              <div>
                <Label>Minimum Order for Free Shipping (₹)</Label>
                <Input type="number" defaultValue="999" />
              </div>
              <div>
                <Label>Standard Shipping Charge (₹)</Label>
                <Input type="number" defaultValue="0" />
              </div>
              <div>
                <Label>Estimated Delivery Time (days)</Label>
                <Input defaultValue="5-7 business days" />
              </div>
              <Button className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Shipping Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}