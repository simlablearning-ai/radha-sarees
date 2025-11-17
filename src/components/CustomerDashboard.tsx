import { useState } from "react";
import { useStore } from "../lib/store";
import { syncedActions } from "../lib/useData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  User, 
  Package, 
  FileText, 
  CreditCard, 
  MapPin, 
  LogOut,
  Download,
  Eye,
  Home
} from "lucide-react";
import { toast } from "sonner";

interface CustomerDashboardProps {
  onLogout: () => void;
}

export function CustomerDashboard({ onLogout }: CustomerDashboardProps) {
  const { 
    currentCustomer, 
    orders, 
    customerPaymentMethods,
    customerBillingAddresses,
    updateCustomerProfile,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    addBillingAddress,
    updateBillingAddress,
    deleteBillingAddress
  } = useStore();

  const [activeTab, setActiveTab] = useState("orders");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(currentCustomer);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // If no customer is logged in, show error state
  if (!currentCustomer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="mb-2">Not Logged In</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to access your account dashboard
          </p>
          <Button 
            onClick={() => {
              window.location.hash = '';
              window.location.reload();
            }}
            className="bg-primary text-primary-foreground"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Get customer orders
  const customerOrders = orders.filter(order => 
    order.customerEmail === currentCustomer?.email
  );

  const handleProfileUpdate = () => {
    if (profileData) {
      updateCustomerProfile(profileData);
      setEditingProfile(false);
      toast.success("Profile updated successfully");
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-chart-4 text-white",
      processing: "bg-accent text-accent-foreground",
      shipped: "bg-chart-3 text-white",
      delivered: "bg-chart-3 text-white",
      cancelled: "bg-destructive text-destructive-foreground"
    };
    return colors[status as keyof typeof colors] || "bg-muted";
  };

  const handleDownloadInvoice = (orderId: string) => {
    toast.success(`Invoice for ${orderId} downloaded`);
    // In a real app, this would generate and download a PDF
  };

  const handleViewInvoice = (orderId: string) => {
    setSelectedInvoice(orderId);
  };

  const renderInvoice = (orderId: string) => {
    const order = customerOrders.find(o => o.id === orderId);
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-3xl bg-card p-8 max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={() => setSelectedInvoice(null)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>

          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="text-center space-y-2">
              <h1 style={{ 
                fontFamily: 'var(--font-family-script)', 
                fontSize: 'var(--text-3xl)',
                color: 'var(--color-primary)'
              }}>
                Radha Sarees
              </h1>
              <p className="text-muted-foreground">Tax Invoice</p>
            </div>

            <Separator />

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="mb-2">Invoice To:</h3>
                <p>{order.customerName}</p>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  {order.customerEmail}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  {order.customerPhone}
                </p>
                <p className="text-muted-foreground mt-2" style={{ fontSize: 'var(--text-sm)' }}>
                  {order.shippingAddress}
                </p>
              </div>
              <div className="text-right">
                <p><span className="text-muted-foreground">Invoice #:</span> {order.id}</p>
                <p><span className="text-muted-foreground">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><span className="text-muted-foreground">Status:</span> 
                  <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </p>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-border">
                      <td className="py-3">{item.productName}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="text-right py-3">₹{item.price.toLocaleString()}</td>
                      <td className="text-right py-3">₹{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>₹{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (18%):</span>
                  <span>₹{(order.totalAmount * 0.18).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>₹{(order.totalAmount * 1.18).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <Separator />
            <div>
              <p><span className="text-muted-foreground">Payment Method:</span> {order.paymentMethod}</p>
              <p><span className="text-muted-foreground">Payment Status:</span> 
                <Badge className={`ml-2 ${order.paymentStatus === 'completed' ? 'bg-chart-3 text-white' : 'bg-chart-4 text-white'}`}>
                  {order.paymentStatus}
                </Badge>
              </p>
            </div>

            <div className="flex gap-4 justify-end mt-6">
              <Button onClick={() => handleDownloadInvoice(order.id)} className="bg-primary text-primary-foreground">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {selectedInvoice && renderInvoice(selectedInvoice)}
      
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  window.location.hash = '';
                  window.location.reload();
                }}
                className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Store
              </Button>
              <div>
                <h1>Welcome, {currentCustomer?.name}</h1>
                <p className="text-primary-foreground/80 mt-1" style={{ fontSize: 'var(--text-sm)' }}>
                  {currentCustomer?.email}
                </p>
              </div>
            </div>
            <Button 
              onClick={onLogout} 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <h2>My Orders</h2>
            {customerOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <h3>Order {order.id}</h3>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <img 
                            src={item.image} 
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded"
                            style={{ borderRadius: 'var(--radius)' }}
                          />
                          <div className="flex-1">
                            <p>{item.productName}</p>
                            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                              Qty: {item.quantity} × ₹{item.price.toLocaleString()}
                            </p>
                          </div>
                          <p>₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <p>Total: ₹{order.totalAmount.toLocaleString()}</p>
                      <Button 
                        onClick={() => handleViewInvoice(order.id)}
                        className="bg-secondary text-secondary-foreground"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Invoice
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <h2>Invoices</h2>
            {customerOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No invoices available</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <h3>Invoice {order.id}</h3>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                          Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="mt-2">Amount: ₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleViewInvoice(order.id)}
                          className="bg-secondary text-secondary-foreground"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button 
                          onClick={() => handleDownloadInvoice(order.id)}
                          className="bg-primary text-primary-foreground"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2>Profile Settings</h2>
              {!editingProfile && (
                <Button 
                  onClick={() => setEditingProfile(true)}
                  className="bg-primary text-primary-foreground"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            <Card className="p-6">
              {editingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData?.name || ""}
                        onChange={(e) => setProfileData({ ...profileData!, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData?.email || ""}
                        onChange={(e) => setProfileData({ ...profileData!, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData?.phone || ""}
                        onChange={(e) => setProfileData({ ...profileData!, phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={profileData?.pincode || ""}
                        onChange={(e) => setProfileData({ ...profileData!, pincode: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profileData?.address || ""}
                      onChange={(e) => setProfileData({ ...profileData!, address: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData?.city || ""}
                        onChange={(e) => setProfileData({ ...profileData!, city: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profileData?.state || ""}
                        onChange={(e) => setProfileData({ ...profileData!, state: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <Button 
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileData(currentCustomer);
                      }}
                      className="bg-secondary text-secondary-foreground"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleProfileUpdate}
                      className="bg-primary text-primary-foreground"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="mt-1">{currentCustomer?.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="mt-1">{currentCustomer?.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="mt-1">{currentCustomer?.phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Pincode</Label>
                      <p className="mt-1">{currentCustomer?.pincode || "Not provided"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="mt-1">{currentCustomer?.address || "Not provided"}</p>
                    <p className="mt-1">
                      {currentCustomer?.city && currentCustomer?.state 
                        ? `${currentCustomer.city}, ${currentCustomer.state}` 
                        : ""}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2>Payment Methods</h2>
              <Button 
                onClick={() => {
                  addPaymentMethod({
                    type: 'card',
                    name: 'New Card',
                    details: '**** **** **** 1234',
                    isDefault: customerPaymentMethods.length === 0
                  });
                  toast.success("Payment method added");
                }}
                className="bg-primary text-primary-foreground"
              >
                Add Payment Method
              </Button>
            </div>

            {customerPaymentMethods.length === 0 ? (
              <Card className="p-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No payment methods added</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerPaymentMethods.map((method) => (
                  <Card key={method.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4>{method.name}</h4>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                          {method.type.toUpperCase()}
                        </p>
                      </div>
                      {method.isDefault && (
                        <Badge className="bg-chart-3 text-white">Default</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">{method.details}</p>
                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button
                          onClick={() => {
                            updatePaymentMethod(method.id, { isDefault: true });
                            toast.success("Default payment method updated");
                          }}
                          className="flex-1 bg-secondary text-secondary-foreground"
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          deletePaymentMethod(method.id);
                          toast.success("Payment method removed");
                        }}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Billing Addresses Tab */}
          <TabsContent value="billing" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2>Billing Addresses</h2>
              <Button 
                onClick={() => {
                  addBillingAddress({
                    name: currentCustomer?.name || '',
                    address: currentCustomer?.address || '',
                    city: currentCustomer?.city || '',
                    state: currentCustomer?.state || '',
                    pincode: currentCustomer?.pincode || '',
                    phone: currentCustomer?.phone || '',
                    isDefault: customerBillingAddresses.length === 0
                  });
                  toast.success("Billing address added");
                }}
                className="bg-primary text-primary-foreground"
              >
                Add Address
              </Button>
            </div>

            {customerBillingAddresses.length === 0 ? (
              <Card className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No billing addresses added</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerBillingAddresses.map((address) => (
                  <Card key={address.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4>{address.name}</h4>
                      {address.isDefault && (
                        <Badge className="bg-chart-3 text-white">Default</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-muted-foreground mb-4">
                      <p>{address.address}</p>
                      <p>{address.city}, {address.state} - {address.pincode}</p>
                      <p>{address.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <Button
                          onClick={() => {
                            updateBillingAddress(address.id, { isDefault: true });
                            toast.success("Default billing address updated");
                          }}
                          className="flex-1 bg-secondary text-secondary-foreground"
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          deleteBillingAddress(address.id);
                          toast.success("Billing address removed");
                        }}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}