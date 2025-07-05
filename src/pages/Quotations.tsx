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

  useEffect(() => {
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
        // You can adjust fromMonth/toMonth as needed
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
    fetchQuotations();
    // eslint-disable-next-line
  }, []);

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
        <div className="bg-white rounded-lg shadow p-6 mt-4">
          <h2 className="text-lg font-semibold mb-4">Your Quotations</h2>
          <ul>
            {quotations.map((q) => (
              <li key={q._id} className="border-b py-2">
                <span className="font-medium">{q.title}</span> <span className="text-gray-500">({q.quotationRefNumber})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Quotations;
