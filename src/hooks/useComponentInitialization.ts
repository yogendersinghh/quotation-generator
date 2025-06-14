import { useAuthContext } from '../features/auth/context/AuthContext';
import { useAuthStore } from '../store/auth';

/**
 * Custom hook to ensure proper component initialization and prevent hooks order issues
 * This hook should be called at the very beginning of every component that needs auth
 */
export function useComponentInitialization() {
  const { isInitialized } = useAuthContext();
  const user = useAuthStore((state) => state.user);
  
  return {
    isInitialized,
    user,
    isAdmin: user?.role?.toLowerCase()?.trim() === 'admin',
    isVendor: user?.role?.toLowerCase()?.trim() === 'vendor',
  };
} 