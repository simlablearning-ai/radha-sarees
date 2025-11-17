import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { X } from "lucide-react";

interface CustomerAuthProps {
  onLogin: (email: string, password: string) => void | Promise<void>;
  onSignup: (data: SignupData) => void | Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export function CustomerAuth({ onLogin, onSignup, onClose, isOpen }: CustomerAuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with:', loginEmail);
    
    if (!loginEmail || !loginPassword) {
      console.error('Missing login credentials');
      alert('Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    console.log('Calling onLogin handler...');
    try {
      await onLogin(loginEmail, loginPassword);
      console.log('onLogin completed successfully');
    } catch (error) {
      console.error('Login error in CustomerAuth:', error);
      alert('Login failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup form submitted with:', signupData);
    
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.phone) {
      console.error('Missing required signup fields');
      alert('Please fill in all required fields (Name, Email, Phone, Password)');
      return;
    }
    
    setIsLoading(true);
    console.log('Calling onSignup handler...');
    try {
      await onSignup(signupData);
      console.log('onSignup completed successfully');
    } catch (error) {
      console.error('Signup error in CustomerAuth:', error);
      alert('Signup failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="mb-6 text-center text-foreground">
          {activeTab === 'login' ? 'Customer Login' : 'Create Account'}
        </h2>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 transition-colors ${
              activeTab === 'login'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 transition-colors ${
              activeTab === 'signup'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        )}

        {/* Signup Form */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="signup-name">Full Name *</Label>
              <Input
                id="signup-name"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                placeholder="Your Name"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="signup-email">Email *</Label>
              <Input
                id="signup-email"
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                placeholder="your@email.com"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="signup-phone">Phone *</Label>
              <Input
                id="signup-phone"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="signup-password">Password *</Label>
              <Input
                id="signup-password"
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                placeholder="••••••••"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="signup-address">Address</Label>
              <Input
                id="signup-address"
                value={signupData.address}
                onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                placeholder="Street Address"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="signup-city">City</Label>
                <Input
                  id="signup-city"
                  value={signupData.city}
                  onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                  placeholder="City"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="signup-state">State</Label>
                <Input
                  id="signup-state"
                  value={signupData.state}
                  onChange={(e) => setSignupData({ ...signupData, state: e.target.value })}
                  placeholder="State"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="signup-pincode">Pincode</Label>
              <Input
                id="signup-pincode"
                value={signupData.pincode}
                onChange={(e) => setSignupData({ ...signupData, pincode: e.target.value })}
                placeholder="123456"
                className="mt-1"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}