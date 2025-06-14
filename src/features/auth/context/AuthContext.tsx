import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokenStorage } from '../utils';
import type { AuthState, AuthResponse } from '../types';

type AuthContextType = AuthState & {
  isInitialized: boolean;
  setAuthState: (authData: AuthResponse) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('AuthContext - Current state:', state);
  console.log('AuthContext - Is initialized:', isInitialized);

  const setAuthState = useCallback((authData: AuthResponse) => {
    console.log('Setting auth state with data:', authData);
    
    // If authData has empty values, treat it as a logout
    if (!authData.token || !authData.user.id) {
      console.log('Empty auth data - logging out');
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } else {
      console.log('Setting authenticated state with user:', authData.user);
      setState({
        user: authData.user,
        token: authData.token,
        isAuthenticated: true,
      });
    }
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      console.log('=== AUTH INITIALIZATION START ===');
      const token = tokenStorage.getToken();
      const user = tokenStorage.getUser();
      
      console.log('Retrieved from storage - token exists:', !!token);
      console.log('Retrieved from storage - user exists:', !!user);
      console.log('Retrieved from storage - user data:', user);

      if (token && user) {
        console.log('Found valid auth data in storage, setting authenticated state');
        setState({
          user,
          token,
          isAuthenticated: true,
        });
      } else {
        console.log('No valid auth data in storage, setting unauthenticated state');
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      }
      console.log('=== AUTH INITIALIZATION COMPLETE ===');
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  // Handle route protection - only after initialization
  useEffect(() => {
    if (!isInitialized) {
      console.log('Auth not initialized yet, skipping route protection');
      return;
    }

    console.log('=== ROUTE PROTECTION CHECK ===');
    console.log('Current path:', location.pathname);
    console.log('Auth state:', state);
    console.log('Is authenticated from state:', state.isAuthenticated);
    console.log('Token valid from storage:', tokenStorage.isValid());

    const isAuthPage = location.pathname === '/login';
    // Use the state from context instead of checking storage again
    const isAuthenticated = state.isAuthenticated;

    console.log('Is auth page:', isAuthPage);
    console.log('Is authenticated:', isAuthenticated);

    if (!isAuthenticated && !isAuthPage) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/login', {
        replace: true,
        state: { from: location.pathname }
      });
    } else if (isAuthenticated && isAuthPage) {
      console.log('✅ Authenticated on login page, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    } else if (isAuthenticated && location.pathname === '/') {
      console.log('✅ Authenticated on root path, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    } else {
      console.log('✅ No redirect needed - user can stay on current page');
    }
    console.log('=== ROUTE PROTECTION COMPLETE ===');
  }, [state.isAuthenticated, isInitialized, location.pathname, navigate]);

  const value = {
    ...state,
    isInitialized,
    setAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 