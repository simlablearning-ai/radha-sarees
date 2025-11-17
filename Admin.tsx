import { useState } from "react";
import { useStore } from "./lib/store";
import { AdminLogin } from "./components/admin/AdminLogin";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ProductManagement } from "./components/admin/ProductManagement";
import { OrderManagement } from "./components/admin/OrderManagement";
import { ReportManagement } from "./components/admin/ReportManagement";
import { SettingsManagement } from "./components/admin/SettingsManagement";
import { ImageManagement } from "./components/admin/ImageManagement";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  Image,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Button } from "./components/ui/button";

type AdminView = 'dashboard' | 'products' | 'orders' | 'images' | 'reports' | 'settings';

export default function Admin() {
  const { isAdminAuthenticated, adminUsername, login, logout } = useStore();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  // Show login if not authenticated
  if (!isAdminAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  const menuItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as AdminView, label: 'Products', icon: Package },
    { id: 'orders' as AdminView, label: 'Orders', icon: ShoppingCart },
    { id: 'images' as AdminView, label: 'Images', icon: Image },
    { id: 'reports' as AdminView, label: 'Reports', icon: FileText },
    { id: 'settings' as AdminView, label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
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
              href="#"
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