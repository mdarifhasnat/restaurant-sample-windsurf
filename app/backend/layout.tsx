'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FolderTree, 
  FileText,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import NewOrderNotification from './components/NewOrderNotification';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

const navigation = [
  { name: 'Dashboard', href: '/backend', icon: LayoutDashboard },
  { name: 'Bestellungen', href: '/backend/orders', icon: ShoppingCart },
  { name: 'Produkte', href: '/backend/products', icon: Package },
  { name: 'Kategorien', href: '/backend/categories', icon: FolderTree },
  { name: 'Berichte', href: '/backend/reports', icon: FileText },
  { name: 'Einstellungen', href: '/backend/settings', icon: Settings },
];

export default function BackendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pendingCount } = useOrderNotifications(true);

  const handleLogout = async () => {
    try {
      await fetch('/backend/api/logout', { method: 'POST' });
      router.push('/backend/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Hide sidebar on login page
  const isLoginPage = pathname === '/backend/login';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && !isLoginPage && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - only show if not login page */}
      {!isLoginPage && (
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Speisenreise Admin</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const showBadge = item.name === 'Bestellungen' && pendingCount > 0;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center flex-1">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                    {showBadge && (
                      <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 space-y-2">
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </button>
              <Link
                href="/restaurant"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                ← Zurück zur Website
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - only show if not login page */}
        {!isLoginPage && (
          <div className="bg-white border-b border-gray-200 px-6 py-4 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* New Order Notification */}
      <NewOrderNotification />
    </div>
  );
}
