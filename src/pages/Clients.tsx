import React from 'react';

function Clients() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Add Client
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <p className="text-gray-500 text-center">No clients added yet</p>
        </div>
      </div>
    </div>
  );
}

export default Clients;