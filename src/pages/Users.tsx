import React, { useState, useMemo } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useUsers } from '../features/users/hooks/useUsers';
import toast from 'react-hot-toast';
import { CreateUserForm } from '../features/users/components/CreateUserForm';

// Types
type UserRole = 'admin' | 'user' | 'manager';

type UserStatus = 'active' | 'blocked';

// NOTE: This User type is for mock data, the actual API User type is in src/features/users/hooks/useUsers.ts
type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string; // In a real app, this would be hashed
  role: UserRole;
  status: UserStatus;
  createdBy: string;
  createdAt: Date;
};

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123', // In a real app, this would be hashed
    role: 'admin',
    status: 'active',
    createdBy: 'system',
    createdAt: new Date('2024-01-01')
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
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('email');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [showCreateUserModal, setShowCreateUserModal] = useState(false); // State to control modal visibility

  // Debug logging
  console.log('Current user data:', user);
  console.log('User role:', user?.role);
  console.log('User status:', user?.userStatus);
  console.log('Is admin check:', user?.role === 'admin');

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

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
  });

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

  if (!data?.users.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Users Found</h2>
          <p className="text-gray-600">There are no users in the system yet.</p>
        </div>
      </div>
    );
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          onClick={() => setShowCreateUserModal(true)}
        >
          <Plus className="mr-2" size={20} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

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
                USERNAME <SortIcon field="name" />
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <MoreVertical className="h-5 w-5 text-gray-500" />
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

      {showCreateUserModal && <CreateUserForm onClose={() => setShowCreateUserModal(false)} />}
    </div>
  );
}

export default Users; 