import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { LayoutDashboard, Package, FileText, Users as UsersIcon, LogOut, FolderPlus, Menu, X } from 'lucide-react';

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define navigation items with role restrictions
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { name: 'Product', href: '/products', icon: Package, roles: ['admin', 'manager'] },
    // { name: 'Categories', href: '/categories', icon: FolderPlus, roles: ['admin', 'manager'] },
    // { name: 'Models', href: '/models', icon: Package, roles: ['admin', 'manager'] },
    { name: 'Customers Info', href: '/customers', icon: UsersIcon, roles: ['admin', 'manager'] },
    { name: 'Create Quotations', href: '/quotations', icon: FileText, roles: ['admin', 'manager'] },
    { name: 'Users', href: '/users', icon: UsersIcon, roles: ['admin'] },
    { name: 'Default Formal Text', href: '/default-formal-text', icon: FileText, roles: ['admin', 'manager'] },
  ];

  // Filter navigation based on user role
  const navigation = allNavigation.filter(item => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar for desktop & overlay for mobile */}
        {/* Mobile overlay */}
        <div
          className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity mobile-break:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        {/* Sidebar */}
        <div
          className={`fixed z-50 inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 mobile-break:static mobile-break:translate-x-0 mobile-break:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} mobile-break:translate-x-0`}
          aria-label="Sidebar"
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <h1 className="text-xl font-bold text-gray-800">CRM System</h1>
              {/* Close button for mobile */}
              <button
                className="mobile-break:hidden p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hamburger menu for mobile */}
        <div className="absolute top-0 left-0 z-50 mobile-break:hidden flex items-center h-16 w-full bg-white border-b px-4">
          {sidebarOpen ? (
            <button
              className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-7 h-7" />
            </button>
          ) : (
            <button
              className="p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-7 h-7" />
            </button>
          )}
          <h1 className="ml-4 text-xl font-bold text-gray-800">CRM System</h1>
        </div>
        {/* Main content */}
        <div className="flex-1 overflow-auto mobile-break:ml-0">
          <main className="p-6 pt-20 mobile-break:pt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;