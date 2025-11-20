import { useState } from "react";
import { useStore } from "../lib/store";
import { syncedActions } from "../lib/useData";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { CreditCard, Wallet, Banknote, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onCheckoutComplete: () => void;
}

export function Checkout({ isOpen, onClose, items, onCheckoutComplete }: CheckoutProps) {
  const { addOrder, paymentGateways } = useStore();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
  });

  const totalAmount = items.reduce((sum, item) => {
    const itemPrice = item.price + (item.selectedVariation?.priceAdjustment || 0);
    return sum + itemPrice * item.quantity;
  }, 0);
  const razorpayEnabled = paymentGateways.find(g => g.id === 'razorpay')?.enabled;
  const phonePeEnabled = paymentGateways.find(g => g.id === 'phonepe')?.enabled;

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    const orderItems = items.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price + (item.selectedVariation?.priceAdjustment || 0),
      image: item.image,
      ...(item.selectedVariation && {
        selectedVariation: {
          color: item.selectedVariation.color
        }
      })
    }));

    try {
      await syncedActions.addOrder({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        shippingAddress: formData.shippingAddress,
        items: orderItems,
        totalAmount,
        status: 'pending',
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' 
          : paymentMethod === 'razorpay' ? 'Razorpay' 
          : 'PhonePe',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      });

      setStep('success');
      setTimeout(() => {
        onCheckoutComplete();
        onClose();
        setStep('details');
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          shippingAddress: '',
        });
      }, 3000);
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Checkout</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {step === 'details' && (
            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      required
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label>Phone Number *</Label>
                    <Input
                      type="tel"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <Label>Shipping Address *</Label>
                    <Textarea
                      required
                      value={formData.shippingAddress}
                      onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                      placeholder="Street address, City, State, PIN code"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => {
                    const itemPrice = item.price + (item.selectedVariation?.priceAdjustment || 0);
                    return (
                      <div key={`${item.id}-${item.selectedVariation?.id || 'no-var'}`} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-foreground">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-foreground">
                            ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {item.selectedVariation && (
                          <p className="text-xs text-primary">
                            Color: {item.selectedVariation.color}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full">
                Continue to Payment
              </Button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      {razorpayEnabled && (
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted cursor-pointer">
                          <RadioGroupItem value="razorpay" id="razorpay" />
                          <Label htmlFor="razorpay" className="flex items-center gap-3 cursor-pointer flex-1">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-foreground">Razorpay</p>
                              <p className="text-muted-foreground">
                                Pay securely with cards, UPI, wallets
                              </p>
                            </div>
                          </Label>
                        </div>
                      )}

                      {phonePeEnabled && (
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted cursor-pointer">
                          <RadioGroupItem value="phonepe" id="phonepe" />
                          <Label htmlFor="phonepe" className="flex items-center gap-3 cursor-pointer flex-1">
                            <Wallet className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-foreground">PhonePe</p>
                              <p className="text-muted-foreground">
                                Pay with PhonePe wallet or UPI
                              </p>
                            </div>
                          </Label>
                        </div>
                      )}

                      <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Banknote className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-foreground">Cash on Delivery</p>
                            <p className="text-muted-foreground">
                              Pay when you receive your order
                            </p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-foreground">Total Amount</span>
                    <span className="text-foreground">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handlePlaceOrder} className="flex-1">
                  Place Order
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="mb-6">
                <CheckCircle className="h-20 w-20 mx-auto text-chart-3" />
              </div>
              <h3 className="mb-2">Order Placed Successfully!</h3>
              <p className="text-muted-foreground mb-6">
                Thank you for your order. You will receive a confirmation email shortly.
              </p>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-muted-foreground mb-2">Order Details</p>
                <div className="space-y-1">
                  <p className="text-foreground">{formData.customerName}</p>
                  <p className="text-muted-foreground">{formData.customerEmail}</p>
                  <p className="text-foreground">
                    Total: ₹{totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}