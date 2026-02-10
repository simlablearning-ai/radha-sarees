import { useState, useEffect } from "react";
import { useStore } from "../lib/store";
import { syncedActions } from "../lib/useData";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
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

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  useEffect(() => {
    if (document.getElementById('razorpay-checkout-js')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    // Do not remove script on unmount to prevent reloading issues if component remounts quickly
  }, []);

  const handlePlaceOrder = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default form submission
    
    if (isProcessing) return;
    setIsProcessing(true);

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

    const saveOrder = async (pStatus: 'pending' | 'completed' | 'failed') => {
      try {
        console.log('Saving order with status:', pStatus);
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
          paymentStatus: pStatus,
        });

        console.log('Order saved successfully');
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
          setIsProcessing(false);
        }, 3000);
      } catch (error) {
        console.error('Order placement error:', error);
        toast.error('Failed to place order. Please try again.');
        setIsProcessing(false);
      }
    };

    if (paymentMethod === 'razorpay') {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-226dc7f7/payment/razorpay/create-order`, {
            method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({ amount: totalAmount })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to create payment order');
        }

        const data = await response.json();
        
        const options = {
            key: data.key_id,
            amount: data.order.amount,
            currency: data.order.currency,
            name: "Radha Sarees",
            description: "Payment for Order",
            order_id: data.order.id,
            handler: async function (response: any) {
                console.log('Razorpay payment successful, verifying...', response);
                
                try {
                  // Verify payment with backend
                  const verifyResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-226dc7f7/payment/razorpay/verify`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`
                    },
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature
                    })
                  });

                  if (!verifyResponse.ok) {
                    const errorData = await verifyResponse.json();
                    throw new Error(errorData.error || 'Payment verification failed');
                  }

                  const verifyResult = await verifyResponse.json();
                  if (verifyResult.success) {
                    toast.success('Payment verified successfully!');
                    await saveOrder('completed');
                  } else {
                    throw new Error('Payment verification failed');
                  }
                } catch (verifyError: any) {
                  console.error('Verification error:', verifyError);
                  toast.error(verifyError.message || 'Payment verification failed. Please contact support.');
                  setIsProcessing(false);
                }
            },
            prefill: {
                name: formData.customerName,
                email: formData.customerEmail,
                contact: formData.customerPhone
            },
            theme: {
                color: "#75074f"
            },
            modal: {
              ondismiss: function() {
                console.log('Razorpay modal dismissed');
                toast.info("Payment cancelled");
                setIsProcessing(false);
              }
            }
        };
        
        if (!(window as any).Razorpay) {
          toast.error("Razorpay SDK failed to load. Please check your internet connection.");
          setIsProcessing(false);
          return;
        }

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
            console.error('Razorpay payment failed:', response);
            toast.error(response.error.description);
            setIsProcessing(false);
        });
        rzp1.open();
      } catch (err: any) {
        console.error('Razorpay initialization error:', err);
        toast.error(err.message || "Payment initialization failed");
        setIsProcessing(false);
      }
      return;
    }

    await saveOrder(paymentMethod === 'cod' ? 'pending' : 'completed');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Checkout</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Complete your order by providing shipping details and payment.
          </SheetDescription>
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