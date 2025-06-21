import React, { useState, useMemo, useCallback } from "react";
import { useAuthContext } from "../features/auth/context/AuthContext";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  X,
  User,
  Mail,
  Briefcase,
  MapPin,
  Phone,
  Edit2,
  Trash2,
  MoreVertical,
  Users as UsersIcon, // Renamed to avoid conflict with imported Users type
  FilterX,
  XCircle,
} from "lucide-react";

import { useClients } from "../features/clients/hooks/useClients";
import { Client } from "../features/clients/types";
import { ClientForm } from "../features/clients/components/ClientForm"; // Import the new reusable form component
import { useDeleteClient } from "../features/clients/hooks/useDeleteClient"; // Import the new delete hook
import { ConfirmDeleteCustomerModal } from '../components/ConfirmDeleteCustomerModal';
import toast from "react-hot-toast";

function Customers() {
  const { isInitialized } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL parameters
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get('sortBy') || 'name';
  });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    return (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get('search') || '';
  });
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() => {
    return searchParams.get('search') || '';
  });

  // State for customer form
  const [isFormOpen, setIsFormOpen] = useState(false); // This will be used to control the form for editing/adding
  const [editingCustomer, setEditingCustomer] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Client | null>(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(
    null
  );

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

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setActionDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch clients using the hook with search and sorting
  const { data, isLoading, error } = useClients({
    page,
    limit: 10,
    sortBy,
    sortOrder,
    search: debouncedSearchQuery,
  });

  // Use delete client hook
  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();

  // Access clients and pagination info from the fetched data
  const clients = data?.clients || [];
  const pagination = data?.pagination;

  // Handlers
  const handleAddCustomer = useCallback(() => {
    setEditingCustomer(null); // Ensure no initial data for new client
    setIsFormOpen(true);
  }, []);

  const handleEditCustomer = useCallback((customer: Client) => {
    setEditingCustomer(customer);
    setActionDropdownOpen(null);
    setIsFormOpen(true);
  }, []);

  const handleUpdateCustomer = useCallback(() => {
    // This function is now mostly handled by the ClientForm component
    // It only serves to close the modal for now
    setIsFormOpen(false);
    setEditingCustomer(null);
  }, []);

  const handleDeleteCustomer = useCallback((customer: Client) => {
    setCustomerToDelete(customer);
    setActionDropdownOpen(null);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (customerToDelete) {
      deleteClient(customerToDelete._id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
        },
        onError: (err: any) => {
          console.error('Error deleting client:', err);
          toast.error(err.response?.data?.message || 'Failed to delete customer.');
        },
      });
    }
  }, [customerToDelete, deleteClient]);

  const handleActionClick = useCallback((customerId: string) => {
    setActionDropdownOpen(actionDropdownOpen === customerId ? null : customerId);
  }, [actionDropdownOpen]);

  const handleCloseModal = useCallback(() => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  }, []);

  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const SortIcon = useCallback(({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  }, [sortBy, sortOrder]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Customers</h2>
          <p>Failed to load customers. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <button
          onClick={handleAddCustomer}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="relative">
          <input
            key="customer-search-input"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={
              clients.length === 0
                ? "Add customers to enable search"
                : "Search customers by name..."
            }
            disabled={clients.length === 0}
            autoComplete="off"
            spellCheck="false"
            className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              clients.length === 0
                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            }`}
          />
          <Search
            className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
              clients.length === 0 ? "text-gray-400" : "text-gray-500"
            }`}
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
        {debouncedSearchQuery && clients.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Showing results for: <span className="font-medium">"{debouncedSearchQuery}"</span>
          </div>
        )}
      </div>

      {/* Conditional rendering for customer table or no results message in the content area */}
      {clients.length === 0 ? (
        !debouncedSearchQuery ? (
          // Case 1: No customers in the system AND no active search
          <div className="flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-md w-full">
              <UsersIcon className="w-24 h-24 text-indigo-500 mx-auto mb-6 bg-indigo-50 p-4 rounded-full" />
              <h2 className="text-2xl font-bold mb-3 text-gray-800">No Customers Added Yet</h2>
              <p className="text-gray-600 mb-6">
                Start building your customer database by adding your first customer.<br />
                You can include their contact information and details.
              </p>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center mx-auto transition-colors duration-200"
                onClick={handleAddCustomer}
              >
                <Plus className="mr-2" size={20} /> Add Your First Customer
              </button>
            </div>
          </div>
        ) : (
          // Case 2: A search was performed, but yielded no results
          <div className="flex items-center justify-center">
            <div className="text-center bg-white p-8 rounded-lg shadow-md w-full">
              <Search className="w-24 h-24 text-gray-400 mx-auto mb-6 bg-gray-50 p-4 rounded-full" />
              <h2 className="text-2xl font-bold mb-2 text-gray-800">No Customers Found</h2>
              <p className="text-gray-600 mb-6">
                No customers found matching "{debouncedSearchQuery}". Try a different search term or clear the search.
              </p>
              <button
                onClick={handleClearSearch}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Clear Search
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Customer table */}
          <div className="bg-white rounded-lg shadow">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48 cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    Email <SortIcon field="email" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('position')}
                  >
                    Position <SortIcon field="position" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created By
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Address
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone Number
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.createdBy ? client.createdBy.name : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: client.address }}>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => handleActionClick(client._id)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                          aria-label="Customer actions"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {actionDropdownOpen === client._id && (
                          <div className="absolute right-0 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                              <button
                                onClick={() => handleEditCustomer(client)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100"
                              >
                                <Edit2 className="h-4 w-4 mr-3 text-indigo-500" />
                                Edit Customer
                              </button>
                              <div className="border-t border-gray-100"></div>
                              <button
                                onClick={() => handleDeleteCustomer(client)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-3 text-red-500" />
                                Delete Customer
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
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Results summary */}
          {pagination && (
            <div className="mt-4 text-center text-sm text-gray-600">
              {debouncedSearchQuery ? (
                <span>
                  Showing {clients.length} of {pagination.total} results for "{debouncedSearchQuery}"
                </span>
              ) : (
                <span>
                  Showing {clients.length} of {pagination.total} customers
                </span>
              )}
            </div>
          )}
        </>
      )}

      {/* Customer Form Modal */}
      {isFormOpen && (
        <ClientForm onClose={handleCloseModal} initialData={editingCustomer} />
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <ConfirmDeleteCustomerModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          customerName={customerToDelete.name}
        />
      )}
    </div>
  );
}

export default Customers;
