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
    companyCode?: string;
    companyStage?: string;
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
  
  // Company fields state
  const [companyName, setCompanyName] = useState(companyData?.companyName || '');
  const [companyCode, setCompanyCode] = useState(companyData?.companyCode || '');
  const [companyStage, setCompanyStage] = useState(companyData?.companyStage || 'foundation');
  const [address, setAddress] = useState(companyData?.address || '');
  const [place, setPlace] = useState(companyData?.place || '');
  const [city, setCity] = useState(companyData?.city || '');
  const [state, setState] = useState(companyData?.state || '');
  const [pin, setPin] = useState(companyData?.PIN || '');
  
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
    if (!companyName || !companyCode) {
      alert('Company Name and Company Code are required.');
      return;
    }
    if (!name) {
      alert('Name is required.');
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
        // Include company fields
        companyName,
        companyCode,
        companyStage,
        address,
        place,
        city,
        state,
        PIN: pin,
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
          {/* Company Fields */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="Company Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={companyCode}
                  onChange={e => setCompanyCode(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="Company Code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Stage</label>
                <select
                  value={companyStage}
                  onChange={e => setCompanyStage(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                >
                  <option value="foundation">Foundation</option>
                  <option value="building">Building</option>
                  <option value="running">Running</option>
                  <option value="finished">Finished</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="Address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Place</label>
                <input
                  type="text"
                  value={place}
                  onChange={e => setPlace(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="Place"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">PIN</label>
                <input
                  type="text"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="PIN Code"
                />
              </div>
            </div>
          </div>

          {/* Customer Contact Fields */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-medium text-gray-700">Position</label>
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
                  />
                </div>
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