import React, { useState, useMemo } from 'react';
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
  XCircle
} from 'lucide-react';

import { useClients } from '../features/clients/hooks/useClients';
import { Client } from '../features/clients/types';
import { ClientForm } from '../features/clients/components/ClientForm'; // Import the new reusable form component
import { useDeleteClient } from '../features/clients/hooks/useDeleteClient'; // Import the new delete hook
import toast from 'react-hot-toast';

function Customers() {
  // State for pagination and sorting
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // State for customer form
  const [isFormOpen, setIsFormOpen] = useState(false); // This will be used to control the form for editing/adding
  const [editingCustomer, setEditingCustomer] = useState<Client | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Client | null>(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch clients using the hook
  const { data, isLoading, error } = useClients({
    page,
    limit: 10,
    sortBy,
    sortOrder,
  });

  // Use delete client hook
  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();

  // Access clients and pagination info from the fetched data
  const clients = data?.clients || [];
  const pagination = data?.pagination;

  // Filter customers based on search term (now applied to fetched data)
  const filteredClients = useMemo(() => {
    if (!searchTerm) {
      return clients;
    }
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // Handlers
  const handleAddCustomer = () => {
    setEditingCustomer(null); // Ensure no initial data for new client
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: Client) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleUpdateCustomer = () => {
    // This function is now mostly handled by the ClientForm component
    // It only serves to close the modal for now
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (customer: Client) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
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
  };

  const handleActionClick = (customerId: string) => {
    setActionDropdownOpen(actionDropdownOpen === customerId ? null : customerId);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

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
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={clients.length === 0 ? "Add customers to enable search" : "Search customers by name, email, or position..."}
            disabled={clients.length === 0}
            className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              clients.length === 0 
                ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
                : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          />
          <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
            clients.length === 0 ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
      </div>

      {/* Customers List or Empty State */}
      {clients.length === 0 && !isLoading && !error ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
              <UsersIcon className="w-32 h-32 text-indigo-500 mx-auto relative top-7 z-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Added Yet</h3>
            <p className="text-gray-500 mb-6">
              Start building your customer database by adding your first customer. You can include their contact information and details.
            </p>
            <button
              onClick={handleAddCustomer}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Customer
            </button>
          </div>
        </div>
      ) : filteredClients.length === 0 && searchTerm ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
              <FilterX className="w-32 h-32 text-indigo-500 mx-auto relative top-9 z-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
            <p className="text-gray-500 mb-6">
              No customers match your search criteria. Try adjusting your search terms.
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FilterX className="w-4 h-4 mr-2" />
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Name <SortIcon field="name" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email <SortIcon field="email" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position <SortIcon field="position" />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => handleActionClick(customer._id)}
                        className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {actionDropdownOpen === customer._id && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <a 
                              href="#" 
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                              onClick={() => {
                                handleEditCustomer(customer);
                                setActionDropdownOpen(null);
                              }}
                            >
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </a>
                            <a 
                              href="#" 
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                              onClick={() => {
                                handleDeleteCustomer(customer);
                                setActionDropdownOpen(null);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center mt-4 p-4 border-t border-gray-200">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="mx-3 py-2 text-sm text-gray-700">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Customer Form Modal */}
      {isFormOpen && (
        <ClientForm onClose={handleCloseModal} initialData={editingCustomer} />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm mx-4 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete customer <strong>{customerToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;