import { useState } from "react";
import { useStore } from "../../lib/store";
import { syncedActions } from "../../lib/useData";
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
} from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

type AdminView = 'dashboard' | 'products' | 'orders' | 'images' | 'reviews' | 'reports' | 'settings';

export function AdminPanel() {
  const { isAdminAuthenticated, adminUsername } = useStore();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

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
    <div className="min-h-screen bg-muted">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <h1 className="text-sidebar-foreground mb-2">Radha Sarees</h1>
          <p className="text-sidebar-foreground opacity-70">Admin Panel</p>
        </div>

        <nav className="px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-md mb-1 transition-colors ${
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

          <div className="mt-6 pt-6 border-t border-sidebar-border">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/');
                window.location.reload();
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Visit Site</span>
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-foreground">
              {menuItems.find(item => item.id === currentView)?.label}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.hash = ''}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Store
            </Button>
          </div>
        </header>

        <main className="p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}