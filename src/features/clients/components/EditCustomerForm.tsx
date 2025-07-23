import React, { useState } from 'react';
import { X, User, Mail, Briefcase, Phone, Plus, Trash2 } from 'lucide-react';
import { clientsApi } from '../api';
import { useQueryClient } from '@tanstack/react-query';

interface EditCustomerFormProps {
  initialData: {
    _id: string;
    name: string;
    position: string;
    email: string[];
    phone: string[];
  };
  companyData?: {
    companyName?: string;
    address?: string;
    place?: string;
    city?: string;
    state?: string;
    PIN?: string;
  };
  onClose: () => void;
}

export const EditCustomerForm: React.FC<EditCustomerFormProps> = ({ initialData, companyData, onClose }) => {
  const [name, setName] = useState(initialData.name || '');
  const [position, setPosition] = useState(initialData.position || '');
  const [emails, setEmails] = useState<string[]>(initialData.email && initialData.email.length > 0 ? initialData.email : ['']);
  const [phones, setPhones] = useState<string[]>(initialData.phone && initialData.phone.length > 0 ? initialData.phone : ['']);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const addEmail = () => setEmails([...emails, '']);
  const removeEmail = (idx: number) => {
    if (emails.length === 1) return;
    setEmails(emails.filter((_, i) => i !== idx));
  };
  const updateEmail = (idx: number, value: string) => {
    const arr = [...emails];
    arr[idx] = value;
    setEmails(arr);
  };

  const addPhone = () => setPhones([...phones, '']);
  const removePhone = (idx: number) => {
    if (phones.length === 1) return;
    setPhones(phones.filter((_, i) => i !== idx));
  };
  const updatePhone = (idx: number, value: string) => {
    const arr = [...phones];
    arr[idx] = value;
    setPhones(arr);
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?[0-9\s\-()]{10,}$/.test(phone);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !position) {
      alert('Name and position are required.');
      return;
    }
    if (emails.length === 0 || emails.some((em) => !em.trim() || !validateEmail(em))) {
      alert('Please provide valid email(s).');
      return;
    }
    if (phones.length === 0 || phones.some((ph) => !ph.trim() || !validatePhone(ph))) {
      alert('Please provide valid phone(s).');
      return;
    }
    setIsSaving(true);
    try {
      await clientsApi.updateClient(initialData._id, {
        name,
        position,
        email: emails,
        phone: phones,
        // Optionally include company fields if you want to allow editing them here
        ...(companyData || {})
      });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    } catch (error: any) {
      alert('Failed to update customer: ' + (error?.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto !mt-[0px]">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Customer</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="Contact Name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="Position"
                  required
                />
              </div>
            </div>
          </div>
          {/* Emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email(s) *</label>
            {emails.map((em, emIdx) => (
              <div key={emIdx} className="flex gap-2 mb-2">
                <div className="flex-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={em}
                    onChange={e => updateEmail(emIdx, e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                    placeholder="contact@company.com"
                    required
                  />
                </div>
                {emails.length > 1 && (
                  <button type="button" onClick={() => removeEmail(emIdx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                )}
                {emIdx === emails.length - 1 && (
                  <button type="button" onClick={addEmail} className="text-green-500 hover:text-green-700"><Plus size={18} /></button>
                )}
              </div>
            ))}
          </div>
          {/* Phones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone(s) *</label>
            {phones.map((ph, phIdx) => (
              <div key={phIdx} className="flex gap-2 mb-2">
                <div className="flex-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={ph}
                    onChange={e => updatePhone(phIdx, e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                    placeholder="Phone Number"
                    required
                  />
                </div>
                {phones.length > 1 && (
                  <button type="button" onClick={() => removePhone(phIdx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                )}
                {phIdx === phones.length - 1 && (
                  <button type="button" onClick={addPhone} className="text-green-500 hover:text-green-700"><Plus size={18} /></button>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#F7931E] text-white px-4 py-2 rounded font-medium hover:bg-orange-600 transition-colors"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 