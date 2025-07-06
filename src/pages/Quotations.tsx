import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useAuthContext } from "../features/auth/context/AuthContext";
import { Quotation } from "../features/quotations/types";
import { apiClient } from "../lib/axios";

function Quotations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInitialized } = useAuthContext();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(
    null
  );

  // Check if user is admin or manager (allowed roles for quotations)
  const isAuthorized = user?.role === 'admin' || user?.role === 'manager';

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!isInitialized) return; // Wait for auth to initialize
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAuthorized) {
      navigate('/dashboard');
      return;
    }
  }, [isInitialized, user, isAuthorized, navigate]);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "10",
        sortOrder: "desc",
        userId: user?.id || "",
      });
      const response = await apiClient.get(
        `/api/quotations?${params.toString()}`
      );
      const data = response.data;
      setQuotations(data.quotations || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && user && isAuthorized) {
      fetchQuotations();
    }
  }, [isInitialized, user, isAuthorized]);

  const handleEdit = (id: string) => {
    navigate(`/quotations/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/api/quotations/${deletingId}`);
      setShowDeleteModal(false);
      setDeletingId(null);
      fetchQuotations();
    } catch (err) {
      alert("Failed to delete quotation.");
    }
  };

  const handleActionClick = (quotationId: string) => {
    setActionDropdownOpen(
      actionDropdownOpen === quotationId ? null : quotationId
    );
  };

  // Get status color function
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under_development":
        return "bg-blue-100 text-blue-800";
      case "booked":
        return "bg-green-100 text-green-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".action-dropdown")) {
        setActionDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading state if user is not available yet
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting if not authorized
  if (!isAuthorized) {
    return null;
  }

  // Empty state UI
  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow p-12 text-center mt-8">
      <div className="max-w-md mx-auto">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="90"
              height="90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-indigo-600"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
              <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
              <path d="M10 9H8"></path>
              <path d="M16 13H8"></path>
              <path d="M16 17H8"></path>
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Quotations Available
        </h3>
        <p className="text-gray-500 mb-6">
          You have not created any quotations yet. Start by creating your first
          quotation.
        </p>
        <button
          onClick={() => navigate("/quotations/create")}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Quotation
        </button>
      </div>
    </div>
  );

  // Main page layout
  return (
    <div className="mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Quotations</h1>
        <button
          onClick={() => navigate("/quotations/create")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Quotation
        </button>
      </div>
      {loading ? (
        <div className="text-center py-12">Loading quotations...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : quotations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mt-4 overflow-x-auto flex-1 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Your Quotations</h2>
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ref No
                  </th>
                  <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-2 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-2 sm:px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotations.map((q) => (
                  <tr key={q._id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-6 py-5 whitespace-nowrap font-medium text-gray-900">
                      {q.title || "-"}
                    </td>
                    <td className="px-2 sm:px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {q.quotationRefNumber || "-"}
                    </td>
                    <td className="px-2 sm:px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {q.client?.name || "-"}
                    </td>
                    <td className="px-2 sm:px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {q.subject || "-"}
                    </td>
                    <td className="px-2 sm:px-6 py-5 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 text-xs font-medium rounded-full ${getStatusColor(
                          q.status
                        )}`}
                      >
                        {q.status
                          ? q.status.replace("_", " ").toUpperCase()
                          : "-"}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {q.totalAmount != null
                        ? `₹${q.totalAmount.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-2 sm:px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      {q.createdAt
                        ? new Date(q.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-2 sm:px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative action-dropdown">
                        <button
                          onClick={() => handleActionClick(q._id)}
                          className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        {actionDropdownOpen === q._id && (
                          <div className="fixed right-[24px] mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div
                              className="py-1"
                              role="menu"
                              aria-orientation="vertical"
                            >
                              <button
                                onClick={() => {
                                  handleEdit(q._id);
                                  setActionDropdownOpen(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                              >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </button>
                              {/* <button
                                onClick={() => {
                                  handleDelete(q._id);
                                  setActionDropdownOpen(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                role="menuitem"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </button> */}
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
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">
                  Delete Quotation?
                </h3>
                <p className="mb-6">
                  Are you sure you want to delete this quotation? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Quotations;
