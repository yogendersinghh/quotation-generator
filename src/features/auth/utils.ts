import Cookies from 'js-cookie';
import type { User } from './types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Cookie options for better security
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
  sameSite: 'strict' as const, // Protect against CSRF
  path: '/', // Cookie is available for all paths
};

export const tokenStorage = {
  getToken: () => {
    // Try cookies first, then localStorage as fallback
    let token = Cookies.get(TOKEN_KEY);
    if (!token) {
      token = localStorage.getItem(TOKEN_KEY) || undefined;
    }
    
    console.log('Getting token:', token ? `${token.substring(0, 20)}...` : 'null');
    
    // Only validate if token exists and looks like a JWT
    if (token && !token.includes('.')) {
      console.warn('Token format looks invalid (no dots), clearing auth data');
      tokenStorage.clear();
      return null;
    }
    
    return token;
  },
  
  setToken: (token: string) => {
    console.log('Setting token:', token ? `${token.substring(0, 20)}...` : 'null');
    if (!token) {
      console.error('Attempted to set empty token');
      return;
    }
    
    // Basic JWT validation - should have at least 2 dots
    if (!token.includes('.') || token.split('.').length < 2) {
      console.error('Token format looks invalid');
      return;
    }

    // Set token in cookie with secure options
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
    
    // Also set in localStorage for better persistence
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: () => {
    // Remove from both cookie and localStorage
    Cookies.remove(TOKEN_KEY, { path: '/' });
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getUser: () => {
    // Try cookies first, then localStorage as fallback
    let userStr = Cookies.get(USER_KEY);
    if (!userStr) {
      userStr = localStorage.getItem(USER_KEY) || undefined;
    }
    
    console.log('Getting user from storage:', userStr);
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      console.log('Parsed user data:', user);
      
      // Validate user object structure
      if (!user || typeof user !== 'object' || !user.id || !user.email || !user.role) {
        tokenStorage.clear();
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      tokenStorage.clear();
      return null;
    }
  },
  
  setUser: (user: User) => {
    console.log('Setting user:', user);
    if (!user || typeof user !== 'object') {
      console.error('Invalid user data');
      return;
    }
    
    // Validate required user fields
    if (!user.id || !user.email || !user.role) {
      console.error('User data missing required fields');
      return;
    }
    
    const userStr = JSON.stringify(user);
    
    // Set in cookies
    Cookies.set(USER_KEY, userStr, {
      expires: 7, // 7 days to match token
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Also set in localStorage for better persistence
    localStorage.setItem(USER_KEY, userStr);
  },
  
  removeUser: () => {
    Cookies.remove(USER_KEY, { path: '/' });
    localStorage.removeItem(USER_KEY);
  },
  
  clear: () => {
    console.log('Clearing auth data');
    // Clear all auth data
    tokenStorage.removeToken();
    tokenStorage.removeUser();
    
    // Clear all cookies that might be related to auth
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => {
      if (cookieName.startsWith('auth_')) {
        Cookies.remove(cookieName, { path: '/' });
      }
    });
    
    // Clear any session storage that might contain auth data
    sessionStorage.clear();
  },
  
  // Validate if the current auth state is valid
  isValid: () => {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser();
    console.log('Checking auth validity - token:', !!token, 'user:', !!user);
    return Boolean(token && user && user.id && user.email && user.role);
  },
}; 