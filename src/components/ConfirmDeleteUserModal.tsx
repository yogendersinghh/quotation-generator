import React from 'react';
import { X, AlertCircle } from 'lucide-react';

type ConfirmDeleteUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
};

export const ConfirmDeleteUserModal = ({ isOpen, onClose, onConfirm, userName }: ConfirmDeleteUserModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 !mt-[0px]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center mb-6">
          <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
          <p className="text-gray-700">
            Are you sure you want to delete user <span className="font-semibold">"{userName}"</span>?
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}; 