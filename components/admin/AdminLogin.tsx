import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";

interface AdminLoginProps {
  onLogin: (username: string, password: string) => boolean;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      const success = onLogin(username, password);
      
      if (success) {
        toast.success("Login successful!");
      } else {
        toast.error("Invalid credentials. Please try again.");
        setPassword("");
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle>Admin Panel Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-lg bg-muted">
              <p className="text-muted-foreground mb-2">Default Credentials:</p>
              <div className="space-y-1">
                <p className="text-foreground">Username: <span className="font-mono">admin</span></p>
                <p className="text-foreground">Password: <span className="font-mono">admin123</span></p>
              </div>
              <p className="text-muted-foreground mt-2">
                Change these credentials in production
              </p>
            </div>

            <div className="mt-4 text-center">
              <a 
                href="#" 
                className="text-primary hover:underline"
              >
                Back to Store
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}