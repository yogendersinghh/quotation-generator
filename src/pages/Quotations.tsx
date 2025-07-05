import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

function Quotations() {
  const navigate = useNavigate();
  // Empty state UI
  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow p-12 text-center mt-8">
      <div className="max-w-md mx-auto">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
          {/* You may need to import FilterX if you want to use it */}
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
      <EmptyState />
    </div>
  );
}

export default Quotations;
