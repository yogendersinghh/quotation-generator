import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { LayoutDashboard, Package, FileText, Users as UsersIcon, LogOut, FolderPlus } from 'lucide-react';

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Define navigation items with role restrictions
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { name: 'Product', href: '/products', icon: Package, roles: ['admin', 'manager'] },
    // { name: 'Categories', href: '/categories', icon: FolderPlus, roles: ['admin', 'manager'] },
    // { name: 'Models', href: '/models', icon: Package, roles: ['admin', 'manager'] },
    { name: 'Customers Info', href: '/customers', icon: UsersIcon, roles: ['admin', 'manager'] },
    { name: 'Create Quotations', href: '/quotations', icon: FileText, roles: ['admin', 'manager'] },
    { name: 'Users', href: '/users', icon: UsersIcon, roles: ['admin'] },
  ];

  // Filter navigation based on user role
  const navigation = allNavigation.filter(item => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 px-4 border-b">
              <h1 className="text-xl font-bold text-gray-800">CRM System</h1>
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

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;