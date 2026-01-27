import { useState } from "react";
import { useStore } from "../../lib/store";
import { syncedActions } from "../../lib/useData";
import { api } from "../../lib/api";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";
import { ProductManagement } from "./ProductManagement";
import { OrderManagement } from "./OrderManagement";
import { ReportManagement } from "./ReportManagement";
import { SettingsManagement } from "./SettingsManagement";
import { ImageManagement } from "./ImageManagement";
import { ReviewManagement } from "./ReviewManagement";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  Image,
  ExternalLink,
  LogOut,
  MessageSquare,
  KeyRound,
  X
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

type AdminView = 'dashboard' | 'products' | 'orders' | 'images' | 'reviews' | 'reports' | 'settings';

export function AdminPanel() {
  const { isAdminAuthenticated, adminUsername } = useStore();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLogin = async (username: string, password: string) => {
    const success = await syncedActions.adminLogin(username, password);
    if (success) {
      toast.success("Welcome back, Admin!");
      return true;
    } else {
      toast.error("Invalid credentials");
      return false;
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      const response = await api.changeAdminPassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      if (response.success) {
        toast.success("Password changed successfully!");
        setIsChangePasswordOpen(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.error || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    }
  };

  // Show login if not authenticated
  if (!isAdminAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as AdminView, label: 'Products', icon: Package },
    { id: 'orders' as AdminView, label: 'Orders', icon: ShoppingCart },
    { id: 'images' as AdminView, label: 'Images', icon: Image },
    { id: 'reviews' as AdminView, label: 'Reviews', icon: MessageSquare },
    { id: 'reports' as AdminView, label: 'Reports', icon: FileText },
    { id: 'settings' as AdminView, label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    syncedActions.adminLogout();
    toast.success("Logged out successfully");
    window.location.hash = '';
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'images':
        return <ImageManagement />;
      case 'reviews':
        return <ReviewManagement />;
      case 'reports':
        return <ReportManagement />;
      case 'settings':
        return <SettingsManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border fixed left-0 top-0 h-full overflow-y-auto z-20">
        <div className="p-6">
          <h1 className="text-sidebar-foreground mb-2 text-xl font-bold font-serif">Radha Sarees</h1>
          <p className="text-sidebar-foreground opacity-70 text-sm">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-2 mt-auto">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/');
              window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Visit Store</span>
          </a>
          
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
          >
            <KeyRound className="h-4 w-4" />
            <span>Change Password</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-sidebar p-4 flex items-center justify-between sticky top-0 z-30">
        <span className="text-sidebar-foreground font-bold">Radha Sarees Admin</span>
        {/* Mobile menu could go here */}
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 min-h-screen bg-muted/30">
        <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
          <div className="px-4 md:px-8 py-4 flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">
              {menuItems.find(item => item.id === currentView)?.label}
            </h2>
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {renderView()}
        </main>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
            <DialogDescription>
              Update your administrator password securely.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}