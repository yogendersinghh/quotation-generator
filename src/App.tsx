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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 6000, // 6 seconds
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              minWidth: '300px',
              textAlign: 'center',
            },
            success: {
              duration: 5000, // 5 seconds
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
              duration: 6000, // 6 seconds
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/"
            element={<Layout />}
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="customers" element={<Customers />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;