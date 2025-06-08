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
    const token = Cookies.get(TOKEN_KEY);
    console.log('Getting token:', token);
    // Validate token format if needed
    if (token && !/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(token)) {
      tokenStorage.clear();
      return null;
    }
    return token;
  },
  
  setToken: (token: string) => {
    console.log('Setting token:', token);
    if (!token) {
      console.error('Attempted to set empty token');
      return;
    }
    
    // Validate token format
    if (!/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(token)) {
      console.error('Invalid token format');
      return;
    }

    // Set token in cookie with secure options
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
    
    // Also set in localStorage for backward compatibility
    // Note: This is less secure but might be needed for some legacy features
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: () => {
    // Remove from both cookie and localStorage
    Cookies.remove(TOKEN_KEY, { path: '/' });
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getUser: () => {
    const userStr = Cookies.get(USER_KEY);
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
    
    Cookies.set(USER_KEY, JSON.stringify(user), {
      expires: 1, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  },
  
  removeUser: () => {
    Cookies.remove(USER_KEY);
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