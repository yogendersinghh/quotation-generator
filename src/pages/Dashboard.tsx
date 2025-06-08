import React, { useState, useMemo } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ChevronDown, Search, Filter, User, DollarSign, Users, Clock, CheckCircle, XCircle, AlertCircle, UserPlus, MoreVertical, Check, X } from 'lucide-react';

// Types
type QuotationStatus = 'pending' | 'approved' | 'rejected' | 'under_development' | 'booked' | 'lost';
type AdminStatus = 'pending' | 'approved' | 'rejected';

type Quotation = {
  id: string;
  name: string;
  customerName: string;
  price: number;
  createdAt: Date;
  quotationStatus: QuotationStatus;
  adminStatus: AdminStatus;
  createdBy: string;
};

type DashboardStats = {
  totalQuotations: number;
  pendingApprovals: number;
  totalClients: number;
  underDevelopment: number;
  booked: number;
  lost: number;
};

function Dashboard() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedQuotationStatus, setSelectedQuotationStatus] = useState<QuotationStatus | ''>('');
  const [selectedAdminStatus, setSelectedAdminStatus] = useState<AdminStatus | ''>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);

  // Mock users data
  const users = [
    { id: '1', name: 'John Doe', role: 'vendor' },
    { id: '2', name: 'Jane Smith', role: 'vendor' },
    { id: '3', name: 'Mike Johnson', role: 'vendor' },
    { id: '4', name: 'Sarah Wilson', role: 'administrator' },
    { id: '5', name: 'David Brown', role: 'user' },
  ];

  // Mock quotations data
  const mockQuotations: Quotation[] = [
    {
      id: '1',
      name: 'Website Development Q1',
      customerName: 'ABC Corp',
      price: 15000,
      createdAt: new Date('2024-03-15'),
      quotationStatus: 'under_development',
      adminStatus: 'approved',
      createdBy: '1'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      customerName: 'XYZ Ltd',
      price: 25000,
      createdAt: new Date('2024-03-10'),
      quotationStatus: 'pending',
      adminStatus: 'pending',
      createdBy: '1'
    },
    {
      id: '3',
      name: 'E-commerce Platform',
      customerName: 'Tech Solutions',
      price: 35000,
      createdAt: new Date('2024-02-28'),
      quotationStatus: 'booked',
      adminStatus: 'approved',
      createdBy: '2'
    },
    {
      id: '4',
      name: 'CRM System',
      customerName: 'Global Services',
      price: 20000,
      createdAt: new Date('2024-02-15'),
      quotationStatus: 'lost',
      adminStatus: 'rejected',
      createdBy: '3'
    },
    {
      id: '5',
      name: 'Cloud Migration',
      customerName: 'Data Systems',
      price: 45000,
      createdAt: new Date('2024-01-20'),
      quotationStatus: 'under_development',
      adminStatus: 'approved',
      createdBy: '1'
    },
  ];

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return users;
    return users.filter(user => 
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [userSearchTerm]);

  // Get user-specific quotations
  const userQuotations = useMemo(() => {
    if (!selectedUser) return [];
    return mockQuotations.filter(q => q.createdBy === selectedUser);
  }, [selectedUser]);

  // Calculate dashboard stats based on user-specific data
  const dashboardStats: DashboardStats = useMemo(() => {
    const quotations = selectedUser ? userQuotations : mockQuotations;
    return {
      totalQuotations: quotations.length,
      pendingApprovals: quotations.filter(q => q.adminStatus === 'pending').length,
      totalClients: new Set(quotations.map(q => q.customerName)).size,
      underDevelopment: quotations.filter(q => q.quotationStatus === 'under_development').length,
      booked: quotations.filter(q => q.quotationStatus === 'booked').length,
      lost: quotations.filter(q => q.quotationStatus === 'lost').length,
    };
  }, [selectedUser, userQuotations]);

  // Get available months from quotations data
  const availableMonths = useMemo(() => {
    const months = new Set(
      mockQuotations.map(quotation => 
        quotation.createdAt.toLocaleString('default', { month: 'long', year: 'numeric' })
      )
    );
    return Array.from(months);
  }, []);

  // Get unique customer names
  const customerNames = useMemo(() => {
    return Array.from(new Set(mockQuotations.map(q => q.customerName)));
  }, []);

  // Update filteredQuotations to use user-specific data
  const filteredQuotations = useMemo(() => {
    let filtered = selectedUser ? userQuotations : mockQuotations;
    
    if (searchTerm) {
      filtered = filtered.filter(quotation => 
        quotation.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedMonth) {
      filtered = filtered.filter(quotation => 
        quotation.createdAt.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth
      );
    }

    if (selectedQuotationStatus) {
      filtered = filtered.filter(quotation => 
        quotation.quotationStatus === selectedQuotationStatus
      );
    }

    if (selectedAdminStatus) {
      filtered = filtered.filter(quotation => 
        quotation.adminStatus === selectedAdminStatus
      );
    }

    if (selectedCustomer) {
      filtered = filtered.filter(quotation => 
        quotation.customerName === selectedCustomer
      );
    }
    
    return filtered;
  }, [selectedUser, userQuotations, searchTerm, selectedMonth, selectedQuotationStatus, selectedAdminStatus, selectedCustomer]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedMonth('');
    setSelectedQuotationStatus('');
    setSelectedAdminStatus('');
    setSelectedCustomer('');
    setIsFilterOpen(false);
  };

  const getQuotationStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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

  const getAdminStatusColor = (status: AdminStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleActionClick = (quotationId: string) => {
    setActionDropdownOpen(actionDropdownOpen === quotationId ? null : quotationId);
  };

  const handleActionSelect = (quotationId: string, action: 'approve' | 'reject') => {
    // Here you would typically make an API call to update the quotation status
    // For now, we'll just update the mock data
    const updatedQuotations = mockQuotations.map(q => {
      if (q.id === quotationId) {
        return {
          ...q,
          adminStatus: action === 'approve' ? 'approved' : 'rejected'
        };
      }
      return q;
    });
    // In a real app, you would update the state with the API response
    // setMockQuotations(updatedQuotations);
    setActionDropdownOpen(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">Welcome back, {user?.name}</div>
      </div>

      {/* User Selection and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="block truncate">
                {selectedUser ? (
                  <span className="flex items-center gap-2">
                    {users.find(u => u.id === selectedUser)?.name}
                    <span className="text-sm text-gray-500">
                      ({users.find(u => u.id === selectedUser)?.role})
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

              {filteredUsers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  No users found
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u.id);
                      setIsUserDropdownOpen(false);
                      setUserSearchTerm('');
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                      selectedUser === u.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{u.name}</span>
                      <span className="text-sm text-gray-500">({u.role})</span>
                    </span>
                    {selectedUser === u.id && (
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Quotations</h3>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalQuotations}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingApprovals}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalClients}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.underDevelopment}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.booked}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.lost}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Improved Filters */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Customers</option>
                  {customerNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Months</option>
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quotation Status
                </label>
                <select
                  value={selectedQuotationStatus}
                  onChange={(e) => setSelectedQuotationStatus(e.target.value as QuotationStatus | '')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_development">Under Development</option>
                  <option value="booked">Booked</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Status
                </label>
                <select
                  value={selectedAdminStatus}
                  onChange={(e) => setSelectedAdminStatus(e.target.value as AdminStatus | '')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {(selectedCustomer || selectedMonth || selectedQuotationStatus || selectedAdminStatus) && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quotations Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quotations</h3>
            </div>
            <div className="min-h-[65px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation Name
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quotation Status
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin Status
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotations.map((quotation) => (
                    <tr key={quotation.id} className="hover:bg-gray-50">
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {quotation.name}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                        {quotation.customerName}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                        ${quotation.price.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                        {quotation.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getQuotationStatusColor(quotation.quotationStatus)}`}>
                          {quotation.quotationStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getAdminStatusColor(quotation.adminStatus)}`}>
                          {quotation.adminStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                        {quotation.adminStatus === 'pending' && (
                          <div className="relative">
                            <button
                              onClick={() => handleActionClick(quotation.id)}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Actions
                              <ChevronDown className="ml-1.5 h-4 w-4" />
                            </button>

                            {actionDropdownOpen === quotation.id && (
                              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                  <button
                                    onClick={() => handleActionSelect(quotation.id, 'approve')}
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                                    role="menuitem"
                                  >
                                    <Check className="w-4 h-4 mr-2 text-green-500" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleActionSelect(quotation.id, 'reject')}
                                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"
                                    role="menuitem"
                                  >
                                    <X className="w-4 h-4 mr-2 text-red-500" />
                                    Reject
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredQuotations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-lg font-medium text-gray-900 mb-2">No quotations found</p>
                          <p className="text-gray-500">Try adjusting your filters or search criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;