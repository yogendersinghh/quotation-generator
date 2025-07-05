import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuthContext } from "../features/auth/context/AuthContext";
import { Quotation } from "../features/quotations/types";
import { tokenStorage } from "../features/auth/utils";
import { apiClient } from "../lib/axios";

function Quotations() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = tokenStorage.getToken();
      if (!token || !user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      const params = new URLSearchParams({
        page: "1",
        limit: "10",
        sortOrder: "desc",
        userId: user.id,
      });
      const response = await apiClient.get(`/api/quotations?${params.toString()}`);
      const data = response.data;
      setQuotations(data.quotations || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
    // eslint-disable-next-line
  }, []);

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

  // Empty state UI
  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow p-12 text-center mt-8">
      <div className="max-w-md mx-auto">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
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
    <div className="mx-auto">
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
        <div className="bg-white rounded-lg shadow p-6 mt-4 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Your Quotations</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ref No</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotations.map((q) => (
                <tr key={q._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{q.quotationRefNumber || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{q.title || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{q.client?.name || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{q.subject || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap capitalize">{q.status || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{q.totalAmount != null ? `₹${q.totalAmount}` : '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button
                      className="text-indigo-600 hover:underline mr-4"
                      onClick={() => handleEdit(q._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => handleDelete(q._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-4">Delete Quotation?</h3>
                <p className="mb-6">Are you sure you want to delete this quotation? This action cannot be undone.</p>
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
