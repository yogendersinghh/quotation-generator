import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { useUsers } from '../features/users/hooks/useUsers';
import { useQuotations, useUpdateQuotationStatus, useDashboardStats, Quotation, QuotationStatus, AdminStatus, DashboardStats } from '../features/quotations';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Search, Filter, User, DollarSign, Users, Clock, CheckCircle, XCircle, AlertCircle, UserPlus, MoreVertical, Check, X } from 'lucide-react';
// import { AuthDebug } from '../components/AuthDebug';

// Remove the old type definitions since we're importing them from quotations
// type QuotationStatus = 'pending' | 'approved' | 'rejected' | 'under_development' | 'booked' | 'lost';
// type AdminStatus = 'pending' | 'approved' | 'rejected';

// type Quotation = {
//   id: string;
//   name: string;
//   customerName: string;
//   price: number;
//   createdAt: Date;
//   quotationStatus: QuotationStatus;
//   adminStatus: AdminStatus;
//   createdBy: string;
// };

// type DashboardStats = {
//   totalQuotations: number;
//   pendingApprovals: number;
//   totalClients: number;
//   underDevelopment: number;
//   booked: number;
//   lost: number;
// };

function Dashboard() {
  const { user } = useAuth();
  const { isInitialized } = useAuthContext();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [fromMonth, setFromMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [toMonth, setToMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedQuotationStatus, setSelectedQuotationStatus] = useState<QuotationStatus | ''>('');
  const [selectedAdminStatus, setSelectedAdminStatus] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Ref for the user dropdown
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Check if user is admin - more robust check
  const isAdmin = user?.role?.toLowerCase()?.trim() === 'admin';

  // Debug logging for user data
  console.log('Dashboard - User debug info:', {
    user,
    userRole: user?.role,
    isAdmin,
    userType: typeof user?.role,
    userString: JSON.stringify(user),
    roleComparison: user?.role === 'admin',
    roleLength: user?.role?.length,
    roleTrimmed: user?.role?.trim(),
    roleLowerCase: user?.role?.toLowerCase()
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearch(userSearchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchTerm]);

  // Debounce search term for quotations
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to first page when search changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Monitor selectedUser changes
  useEffect(() => {
    console.log('selectedUser changed to:', selectedUser);
  }, [selectedUser]);

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Fetch users for the dropdown - ALWAYS call this hook, even if we don't use the data
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers({
    page: 1,
    limit: 100, // Get more users for dropdown
    sortBy: 'name',
    sortOrder: 'asc',
    search: debouncedUserSearch,
    enabled: isInitialized && !!user, // Only fetch when auth is initialized and user exists
  });

  // Fetch dashboard statistics for selected user
  const { data: dashboardStatsData, isLoading: dashboardStatsLoading, refetch: refetchDashboardStats } = useDashboardStats(selectedUser || undefined);
  
  console.log('Dashboard stats hook debug:', {
    selectedUser,
    dashboardStatsData,
    dashboardStatsLoading,
    hasSelectedUser: !!selectedUser,
    statsValues: dashboardStatsData ? {
      totalQuotations: dashboardStatsData.totalQuotations,
      pendingApprovals: dashboardStatsData.pendingApprovals,
      totalClients: dashboardStatsData.totalClients,
      underDevelopment: dashboardStatsData.underDevelopment,
      booked: dashboardStatsData.booked,
      lost: dashboardStatsData.lost,
    } : null
  });

  // Fetch quotations for selected user with server-side filtering (for table)
  const { data: quotationsData, isLoading: quotationsLoading, error: quotationsError } = useQuotations({
    page: currentPage,
    limit: pageSize,
    sortBy: 'title',
    sortOrder: 'desc',
    userId: selectedUser,
    search: searchTerm,
    fromMonth: fromMonth || undefined,
    toMonth: toMonth || undefined,
    status: selectedQuotationStatus || undefined,
    converted: selectedAdminStatus || undefined,
  });

  // Update quotation status mutation
  const updateQuotationStatus = useUpdateQuotationStatus();

  // Monitor updateQuotationStatus mutation
  useEffect(() => {
    if (updateQuotationStatus.isSuccess) {
      console.log('Quotation status updated successfully');
    }
    if (updateQuotationStatus.isError) {
      console.error('Failed to update quotation status:', updateQuotationStatus.error);
    }
  }, [updateQuotationStatus.isSuccess, updateQuotationStatus.isError, updateQuotationStatus.error]);

  // Handle user selection
  const handleUserSelect = useCallback((userId: string) => {
    console.log('handleUserSelect called with userId:', userId);
    setSelectedUser(userId);
    setIsUserDropdownOpen(false);
    setUserSearchTerm('');
    setCurrentPage(1); // Reset to first page when user changes
    
    // Invalidate dashboard stats cache and refetch
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    setTimeout(() => {
      console.log('Triggering dashboard stats refetch for userId:', userId);
      refetchDashboardStats();
    }, 100);
  }, [refetchDashboardStats, queryClient]);

  // Get users from API response
  const users = usersData?.users || [];

  // Get quotations from API response
  const quotations = quotationsData?.quotations || [];
  const pagination = quotationsData?.pagination;

  console.log('Dashboard data:', {
    quotationsData,
    quotations,
    pagination,
    selectedUser,
    quotationsLoading,
    quotationsError,
    currentPage,
    pageSize,
    users,
    selectedCustomer: selectedUser
  });

  // Use dashboard stats from API
  const dashboardStats: DashboardStats = dashboardStatsData || {
    totalQuotations: 0,
    pendingApprovals: 0,
    totalClients: 0,
    underDevelopment: 0,
    booked: 0,
    lost: 0,
  };



  // Handle quotation status update
  const handleActionSelect = useCallback((quotationId: string, action: 'approve' | 'reject') => {
    console.log('Updating quotation status:', { quotationId, action });
    updateQuotationStatus.mutate({
      quotationId,
      action
    }, {
      onSuccess: () => {
        setNotification({
          type: 'success',
          message: `Quotation ${action}d successfully!`
        });
        // Auto-hide notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      },
      onError: () => {
        setNotification({
          type: 'error',
          message: `Failed to ${action} quotation. Please try again.`
        });
        // Auto-hide notification after 5 seconds
        setTimeout(() => setNotification(null), 5000);
      }
    });
    setActionDropdownOpen(null);
  }, [updateQuotationStatus]);

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFromMonth('');
    setToMonth('');
    setSelectedQuotationStatus('');
    setSelectedAdminStatus('');
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // NOW we can have conditional returns after all hooks are called
  // Don't render anything until auth is initialized
  if (!isInitialized) {
    console.log('Dashboard: Auth not initialized yet, showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
          {/* <AuthDebug /> */}
        </div>
      </div>
    );
  }

  // Show loading state if user is not available yet
  if (!user) {
    console.log('Dashboard: Auth initialized but no user data, showing user loading spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
          {/* <AuthDebug /> */}
        </div>
      </div>
    );
  }

  console.log('Dashboard: Auth initialized and user available, rendering dashboard');

  const getQuotationStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_development':
        return 'bg-blue-100 text-blue-800';
      case 'booked':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdminStatusColor = (status: string) => {
    switch (status) {
      case 'Under Development':
        return 'bg-blue-100 text-blue-800';
      case 'Booked':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleActionClick = (quotationId: string) => {
    setActionDropdownOpen(actionDropdownOpen === quotationId ? null : quotationId);
  };

  return (
    <div className="space-y-6">
      {/* <AuthDebug /> */}
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">Welcome back, {user?.name}</div>
        </div>
      </div>

      {/* User Selection and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            disabled={usersLoading}
            className="w-full flex items-center justify-between px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="block truncate">
                {usersLoading ? (
                  'Loading users...'
                ) : selectedUser ? (
                  <span className="flex items-center gap-2">
                    {users.find(u => u._id === selectedUser)?.name}
                    <span className="text-sm text-gray-500">
                      ({users.find(u => u._id === selectedUser)?.role})
                    </span>
                  </span>
                ) : (
                  'Select a user to view their quotations'
                )}
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${
              isUserDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              <div className="px-3 py-2 sticky top-0 bg-white border-b">
                <div className="relative">
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {usersLoading ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500 mr-2"></div>
                    Loading users...
                  </div>
                </div>
              ) : usersError ? (
                <div className="px-3 py-4 text-sm text-red-500 text-center">
                  <div className="flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <div>
                      <div>Error loading users</div>
                      <button 
                        onClick={() => window.location.reload()} 
                        className="text-xs text-indigo-600 hover:text-indigo-800 mt-1"
                      >
                        Click to retry
                      </button>
                    </div>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  {userSearchTerm ? 'No users found matching your search' : 'No users available'}
                </div>
              ) : (
                users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleUserSelect(u._id)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                      selectedUser === u._id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{u.name}</span>
                      <span className="text-sm text-gray-500">({u.role})</span>
                    </span>
                    {selectedUser === u._id && (
                      <span className="text-indigo-600">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          {selectedUser ? (
            <>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search quotations..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </>
          ) : (
            <div className="relative">
              <input
                type="text"
                disabled
                placeholder="Select a user to search quotations"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <Search className="w-5 h-5 text-gray-300 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm text-gray-400 bg-gray-50 px-2">
                  Select a user to search
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {!selectedUser ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="max-w-md mx-auto">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No User Selected</h3>
            <p className="text-gray-500 mb-4">
              Please select a user from the dropdown above to view their quotations and statistics.
            </p>
            <button
              onClick={() => setIsUserDropdownOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Select User
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Quotations</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStatsLoading ? '...' : dashboardStats.totalQuotations}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Pending Approval</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStatsLoading ? '...' : dashboardStats.pendingApprovals}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Users className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStatsLoading ? '...' : dashboardStats.totalClients}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Under Development</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStatsLoading ? '...' : dashboardStats.underDevelopment}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Booked</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStatsLoading ? '...' : dashboardStats.booked}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <XCircle className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Lost</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStatsLoading ? '...' : dashboardStats.lost}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Improved Filters */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-wrap gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {/* Search */}
                {/* <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search quotations..."
                      disabled={quotationsLoading}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div> */}

                {/* Month Range */}
                <div>
                  <label htmlFor="from-month" className="block text-sm font-medium text-gray-700 mb-1">
                    From Month
                  </label>
                  <input
                    type="month"
                    id="from-month"
                    value={fromMonth}
                    onChange={(e) => {
                      setFromMonth(e.target.value);
                      setCurrentPage(1);
                    }}
                    disabled={quotationsLoading}
                    className="w-full h-[38px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="to-month" className="block text-sm font-medium text-gray-700 mb-1">
                    To Month
                  </label>
                  <input
                    type="month"
                    id="to-month"
                    value={toMonth}
                    onChange={(e) => {
                      setToMonth(e.target.value);
                      setCurrentPage(1);
                    }}
                    disabled={quotationsLoading}
                    min={fromMonth}
                    className="w-full h-[38px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Quotation Status */}
                <div>
                  <label htmlFor="quotation-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Quotation Status
                  </label>
                  <select
                    id="quotation-status"
                    value={selectedQuotationStatus}
                    onChange={(e) => {
                      setSelectedQuotationStatus(e.target.value as QuotationStatus | '');
                      setCurrentPage(1);
                    }}
                    disabled={quotationsLoading}
                    className="w-full h-[38px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Admin Status */}
                <div>
                  <label htmlFor="admin-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Status
                  </label>
                  <select
                    id="admin-status"
                    value={selectedAdminStatus}
                    onChange={(e) => {
                      setSelectedAdminStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    disabled={quotationsLoading}
                    className="w-full h-[38px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">All Statuses</option>
                    <option value="Under Development">Under Development</option>
                    <option value="Booked">Booked</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>

              {(fromMonth || toMonth || selectedQuotationStatus || selectedAdminStatus || searchTerm) && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    disabled={quotationsLoading}
                    className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Filter indicator */}
            {(fromMonth || toMonth || selectedQuotationStatus || selectedAdminStatus || searchTerm) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Filters applied: {[
                      searchTerm && 'Search',
                      (fromMonth || toMonth) && 'Month Range',
                      selectedQuotationStatus && 'Status',
                      selectedAdminStatus && 'Conversion Status'
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Showing filtered results. Stats above show overall data for this user.
                </p>
              </div>
            )}
          </div>

          {/* Quotations Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quotations</h3>
                <div className="text-sm text-gray-500">
                  {quotationsLoading ? (
                    'Loading...'
                  ) : (
                    `Showing ${quotations.length} of ${pagination?.total || 0} quotations`
                  )}
                </div>
              </div>
            </div>
            <div className="min-h-[65px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation Title
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Name
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion Status
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotations.map((quotation) => (
                    <tr key={quotation._id} className="hover:bg-gray-50">
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quotation.title}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                        {quotation.client?.name || 'Unknown'}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                        ${quotation.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quotation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getQuotationStatusColor(quotation.status as QuotationStatus)}`}>
                          {quotation.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getAdminStatusColor(quotation.converted as string)}`}>
                          {quotation.converted.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => handleActionClick(quotation._id)}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>

                          {actionDropdownOpen === quotation._id && (
                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1" role="menu" aria-orientation="vertical">
                                <button
                                  onClick={() => handleActionSelect(quotation._id, 'approve')}
                                  disabled={updateQuotationStatus.isPending}
                                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  role="menuitem"
                                >
                                  {updateQuotationStatus.isPending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500 mr-2"></div>
                                  ) : (
                                    <Check className="w-4 h-4 mr-2 text-green-500" />
                                  )}
                                  {updateQuotationStatus.isPending ? 'Approving...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleActionSelect(quotation._id, 'reject')}
                                  disabled={updateQuotationStatus.isPending}
                                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  role="menuitem"
                                >
                                  {updateQuotationStatus.isPending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500 mr-2"></div>
                                  ) : (
                                    <X className="w-4 h-4 mr-2 text-red-500" />
                                  )}
                                  {updateQuotationStatus.isPending ? 'Rejecting...' : 'Reject'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          {quotationsLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                              <p className="text-lg font-medium text-gray-900 mb-2">Loading quotations...</p>
                            </>
                          ) : quotationsError ? (
                            <>
                              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                              <p className="text-lg font-medium text-gray-900 mb-2">Error loading quotations</p>
                              <p className="text-gray-500">Please try again later</p>
                            </>
                          ) : (
                            <>
                              <p className="text-lg font-medium text-gray-900 mb-2">No quotations found</p>
                              <p className="text-gray-500">This user has no quotations yet</p>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.pages > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1 || quotationsLoading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={quotationsLoading}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            pagination.page === pageNum
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {pagination.pages > 5 && (
                      <span className="px-2 text-sm text-gray-500">...</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages || quotationsLoading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;