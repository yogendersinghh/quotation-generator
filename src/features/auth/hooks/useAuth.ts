import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api';
import { tokenStorage } from '../utils';
import { useAuthContext } from '../context/AuthContext';
import { useAuthStore } from '../../../store/auth';
import type { LoginCredentials } from '../types';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, setAuthState } = useAuthContext();
  const setUser = useAuthStore((state) => state.setUser);

  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        console.log('Attempting login with credentials:', { email: credentials.email });
        const response = await authApi.login(credentials);
        console.log('Login response:', response);
        return response;
      } catch (error: any) {
        console.error('Login error:', error);
        // Handle specific error cases
        if (error.response?.status === 401) {
          throw new Error('Invalid email or password');
        } else if (error.response?.status === 404) {
          throw new Error('User not found');
        } else {
          throw new Error(error.response?.data?.message || 'An error occurred during login');
        }
      }
    },
    onSuccess: (data) => {
      console.log('Login successful, storing auth data:', data);
      // Store token and user data
      tokenStorage.setToken(data.token);
      tokenStorage.setUser(data.user);
      
      // Update auth context state
      setAuthState(data);
      
      // Update Zustand store for components that use it
      setUser(data.user);
      
      // Invalidate any existing queries
      queryClient.clear();
      
      // Show success message
      toast.success('Successfully logged in!');
      
      // Determine redirect path based on user role
      const from = (location.state as any)?.from;
      let redirectPath = '/dashboard'; // Default for admin
      
      if (from) {
        // If there's a specific page they were trying to access, go there
        redirectPath = from;
      } else if (data.user.role === 'manager') {
        // Managers go to products page
        redirectPath = '/products';
      } else if (data.user.role === 'user') {
        // Regular users go to products page
        redirectPath = '/products';
      }
      // Admins go to dashboard (default)
      
      console.log('Redirecting to:', redirectPath, 'for role:', data.user.role);
      navigate(redirectPath, { replace: true });
    },
    onError: (error: Error) => {
      console.error('Login mutation error:', error);
      toast.error(error.message);
    },
  });

  const logout = () => {
    console.log('Logging out user');
    // Clear all auth data
    tokenStorage.clear();
    
    // Clear auth context state
    setAuthState({ 
      token: '', 
      user: { 
        id: '', 
        name: '', 
        email: '', 
        role: '',
        userStatus: ''
      } 
    });
    
    // Clear all queries
    queryClient.clear();
    
    // Show success message
    toast.success('Successfully logged out!');
    
    // Redirect to login
    navigate('/login', { replace: true });
  };

  return {
    login: login.mutate,
    logout,
    isLoading: login.isPending,
    error: login.error,
    isAuthenticated,
    user,
  };
}; 