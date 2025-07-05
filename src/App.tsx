import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './features/auth/context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Products from './pages/Products';
import Quotations from './pages/Quotations';
import Users from './pages/Users';
import Layout from './components/Layout';
import Customers from './pages/Customers';
import Categories from './pages/Categories';
import Models from './pages/Models';
import { ProtectedRoute } from './components/ProtectedRoute';
import CreateQuotation from './pages/CreateQuotation';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 1000, // 1 second
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              minWidth: '300px',
              textAlign: 'center',
            },
            success: {
              duration: 1000, // 1 second
              style: {
                background: '#059669', // Emerald-600 color, more eye-friendly
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                minWidth: '300px',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            },
            error: {
              duration: 1000, // 1 second
              style: {
                background: '#dc2626', // Red-600 color, more eye-friendly
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                minWidth: '300px',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route
            path="/"
            element={<Layout />}
          >
            {/* Admin-only routes */}
            <Route 
              path="dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']} fallbackPath="/products">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="users" 
              element={
                <ProtectedRoute allowedRoles={['admin']} fallbackPath="/products">
                  <Users />
                </ProtectedRoute>
              } 
            />
            
            {/* Routes accessible to all authenticated users */}
            <Route path="products" element={<Products />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="customers" element={<Customers />} />
            <Route path="categories" element={<Categories />} />
            <Route path="models" element={<Models />} />
            <Route path="quotations/create" element={<CreateQuotation />} />
            <Route path="quotations/edit/:id" element={<CreateQuotation />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;