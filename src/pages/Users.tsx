import React, { useState, useMemo, useCallback } from 'react';
import { useAuthStore } from '../store/auth';
import { 
  Plus, 
  Search, 
  X, 
  User,
  Mail,
  Lock,
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  MoreVertical,
  Users as UsersIcon,
  FilterX,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Select from 'react-select';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useUsers } from '../features/users/hooks/useUsers';
import toast from 'react-hot-toast';
import { CreateUserForm } from '../features/users/components/CreateUserForm';
import { EditUserForm } from '../features/users/components/EditUserForm';
import { ConfirmDeleteUserModal } from '../components/ConfirmDeleteUserModal';
import { useDeleteUser } from '../features/users/hooks/useDeleteUser';
import { User as UserApiType, User as UserHookType } from '../features/users/hooks/useUsers';
import { useAuthContext } from '../features/auth/context/AuthContext';

// Types
type UserRole = 'admin' | 'user' | 'manager';

type UserStatus = 'active' | 'blocked';

// Mock users data
const mockUsers: UserHookType[] = [
  {
    _id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    userStatus: 'active',
    createdAt: new Date('2024-01-01').toISOString(), // Converted to ISO string
    updatedAt: new Date('2024-01-01').toISOString(), // Added for mock consistency
    __v: 0, // Added for mock consistency
  }
];

// Role options for dropdown (used for display mapping)
const roleDisplayMap: Record<UserRole, string> = {
  admin: 'Administrator',
  user: 'User',
  manager: 'Manager',
};

function Users() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Get auth context to check initialization
  const { isInitialized } = useAuthContext();
  
  // Initialize state from URL parameters
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get('sortBy') || 'email';
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    return (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get('search') || '';
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() => {
    return searchParams.get('search') || '';
  });
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserHookType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserHookType | null>(null);

  // Function to update URL parameters
  const updateURLParams = useCallback((updates: Record<string, string | number>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    });
    
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  // Update URL when state changes
  React.useEffect(() => {
    updateURLParams({
      page,
      sortBy,
      sortOrder,
      search: searchQuery,
    });
  }, [page, sortBy, sortOrder, searchQuery, updateURLParams]);

  // Sync state with URL parameters on mount
  React.useEffect(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sortBy');
    const sortOrderParam = searchParams.get('sortOrder');
    const searchParam = searchParams.get('search');

    if (pageParam && parseInt(pageParam, 10) !== page) {
      setPage(parseInt(pageParam, 10));
    }
    if (sortByParam && sortByParam !== sortBy) {
      setSortBy(sortByParam);
    }
    if (sortOrderParam && sortOrderParam !== sortOrder) {
      setSortOrder(sortOrderParam as 'asc' | 'desc');
    }
    if (searchParam !== null && searchParam !== searchQuery) {
      setSearchQuery(searchParam);
      setDebouncedSearchQuery(searchParam);
    }
  }, []); // Only run on mount

  // Debug logging
  console.log('Current user data:', user);
  console.log('User role:', user?.role);
  console.log('User status:', user?.userStatus);
  console.log('Is admin check:', user?.role === 'admin');

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Debounce search query with improved logic
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search changes - only when debounced value changes
  React.useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setPage(1);
    }
  }, [debouncedSearchQuery, searchQuery]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Redirect if not admin
  React.useEffect(() => {
    console.log('Auth effect running - isAdmin:', isAdmin);
    console.log('Auth effect - user:', user);
    
    if (!user) {
      console.log('No user data found, redirecting to login');
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      console.log('User is not admin, redirecting to dashboard');
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
    } else {
      console.log('User is admin, allowing access');
    }
  }, [isAdmin, navigate, user]);

  const { data, isLoading, error } = useUsers({
    page,
    limit: 10,
    sortBy,
    sortOrder,
    search: debouncedSearchQuery, // Pass the debounced search query
  });

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  // Handle dropdown toggle
  const handleDropdownToggle = useCallback((userId: string) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  }, [openDropdownId]);

  // Check if dropdown should be positioned above
  const shouldPositionAbove = useCallback((userId: string) => {
    if (openDropdownId !== userId) return false;
    
    const button = document.querySelector(`[data-user-id="${userId}"]`);
    if (!button) return false;
    
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // If there's not enough space below, position above
    return rect.bottom + 120 > viewportHeight;
  }, [openDropdownId]);

  // Handle edit user
  const handleEditUser = useCallback((user: UserHookType) => {
    console.log('Edit user:', user);
    setUserToEdit(user);
    setOpenDropdownId(null);
  }, []);

  // Handle delete user confirmation
  const handleDeleteUser = useCallback((user: UserHookType) => {
    console.log('Attempting to delete user:', user);
    setUserToDelete(user);
    setOpenDropdownId(null);
  }, []);

  // Handle actual deletion after confirmation
  const handleConfirmDelete = useCallback(() => {
    if (userToDelete) {
      deleteUser(userToDelete._id, {
        onSuccess: () => {
          setUserToDelete(null);
        },
        onError: () => {
          setUserToDelete(null);
        },
      });
    }
  }, [userToDelete, deleteUser]);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Handle sort
  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // Sort icon component
  const SortIcon = useCallback(({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  }, [sortBy, sortOrder]);

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Don't render anything while redirecting
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Users</h2>
          <p>Failed to load users. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Ensure data is defined before proceeding, if not handled by loading/error states
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-center">
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p>It seems there was an issue fetching user data. Please try refreshing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header with "Users" title and "Add User" button - ALWAYS VISIBLE */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          onClick={() => setShowCreateUserModal(true)}
        >
          <Plus className="mr-2" size={20} /> Add User
        </button>
      </div>

      {/* Search bar - ALWAYS VISIBLE */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            key="search-input"
            type="text"
            placeholder={data.users.length === 0 && !debouncedSearchQuery
              ? "Add users to enable search"
              : "Search users by name..."
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearchChange}
            autoComplete="off"
            spellCheck="false"
            disabled={data.users.length === 0 && !debouncedSearchQuery}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              type="button"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {debouncedSearchQuery && data.users.length > 0 && ( /* Only show results summary if there are actual results */
          <div className="mt-2 text-sm text-gray-600">
            Showing results for: <span className="font-medium">"{debouncedSearchQuery}"</span>
          </div>
        )}
      </div>

      {/* Conditional rendering for user table or no results message in the content area */}
      {data.users.length === 0 ? (
        !debouncedSearchQuery ? (
          // Case 1: No users in the system AND no active search
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
              <UserPlus className="w-24 h-24 text-blue-500 mx-auto mb-6 bg-blue-50 p-4 rounded-full" />
              <h2 className="text-2xl font-bold mb-3 text-gray-800">No Users Added Yet</h2>
              <p className="text-gray-600 mb-6">
                Start building your user database by adding your first user.<br />
                You can create administrator and regular user accounts.
              </p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center mx-auto transition-colors duration-200"
                onClick={() => setShowCreateUserModal(true)}
              >
                <Plus className="mr-2" size={20} /> Add Your First User
              </button>
            </div>
          </div>
        ) : (
          // Case 2: A search was performed, but yielded no results
          <div className="flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-md w-full">
              <Search className="w-24 h-24 text-gray-400 mx-auto mb-6 bg-gray-50 p-4 rounded-full" />
              <h2 className="text-2xl font-bold mb-2 text-gray-800">No Users Found</h2>
              <p className="text-gray-600 mb-6">
                No users found matching "{debouncedSearchQuery}". Try a different search term or clear the search.
              </p>
              <button
                onClick={handleClearSearch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Clear Search
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          {/* User table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    USER <SortIcon field="name" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    NAME <SortIcon field="name" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    ROLE <SortIcon field="role" />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    STATUS
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-8 w-8 rounded-full text-gray-500 mr-3 bg-gray-100 p-1" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <span className="w-2 h-2 mr-1 rounded-full bg-purple-600"></span>
                        {roleDisplayMap[user.role as UserRole]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                        {user.userStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative dropdown-container">
                        <button
                          data-user-id={user._id}
                          onClick={() => handleDropdownToggle(user._id)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label="User actions"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {openDropdownId === user._id && (
                          <div className={`absolute right-0 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 ring-1 ring-black ring-opacity-5 ${
                            shouldPositionAbove(user._id) ? 'bottom-full mb-2' : 'top-full mt-2'
                          }`}>
                            <div className="py-1">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                              >
                                <Edit2 className="h-4 w-4 mr-3 text-blue-500" />
                                Edit User
                              </button>
                              <div className="border-t border-gray-100"></div>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-3 text-red-500" />
                                Delete User
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Results summary */}
          {data && (
            <div className="mt-4 text-center text-sm text-gray-600">
              {debouncedSearchQuery ? (
                <span>
                  Showing {data.users.length} of {data.pagination.total} results for "{debouncedSearchQuery}"
                </span>
              ) : (
                <span>
                  Showing {data.users.length} of {data.pagination.total} users
                </span>
              )}
            </div>
          )}
        </>
      )}

      {showCreateUserModal && <CreateUserForm onClose={() => setShowCreateUserModal(false)} />}
      {userToEdit && <EditUserForm user={userToEdit} onClose={() => setUserToEdit(null)} />}
      {userToDelete && (
        <ConfirmDeleteUserModal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={handleConfirmDelete}
          userName={userToDelete.name}
        />
      )}
    </div>
  );
}

export default Users; 