import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, MapPin, Phone, Plus, Trash2, Building } from 'lucide-react';
import { useUpdateClient } from '../hooks/useUpdateClient';
import { clientsApi, CreateCompanyWithUsersPayload } from '../api';
import { useQueryClient } from '@tanstack/react-query';

// Types for the new form structure
interface CustomerContact {
  name: string;
  position: string;
  email: string[];
  phone: string[];
}

interface CompanyFormState {
  companyName: string;
  address: string;
  place: string;
  city: string;
  state: string;
  PIN: string;
  customers: CustomerContact[];
}

const emptyCustomer = (): CustomerContact => ({
  name: '',
  position: '',
  email: [''],
  phone: [''],
});

export const ClientForm = ({ onClose, initialData }: { onClose: () => void; initialData?: any }) => {
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();
  const [form, setForm] = useState<CompanyFormState>({
    companyName: '',
    address: '',
    place: '',
    city: '',
    state: '',
    PIN: '',
    customers: [emptyCustomer()],
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData && Array.isArray(initialData.customers)) {
      setForm({
        companyName: initialData.companyName || '',
        address: initialData.address || '',
        place: initialData.place || '',
        city: initialData.city || '',
        state: initialData.state || '',
        PIN: initialData.PIN || '',
        customers: initialData.customers.map((c: any) => ({
          name: c.name || '',
          position: c.position || '',
          email: c.email && c.email.length > 0 ? c.email : [''],
          phone: c.phone && c.phone.length > 0 ? c.phone : [''],
        })),
      });
    } else {
      setForm({
        companyName: '',
        address: '',
        place: '',
        city: '',
        state: '',
        PIN: '',
        customers: [emptyCustomer()],
      });
    }
  }, [initialData]);

  // Company field handler
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Customer field handlers
  const handleCustomerChange = (idx: number, field: keyof CustomerContact, value: string) => {
    const updated = [...form.customers];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, customers: updated });
  };

  // Email/Phone handlers
  const handleCustomerArrayChange = (
    idx: number,
    field: 'email' | 'phone',
    arrIdx: number,
    value: string
  ) => {
    const updated = [...form.customers];
    const arr = [...updated[idx][field]];
    arr[arrIdx] = value;
    updated[idx][field] = arr;
    setForm({ ...form, customers: updated });
  };

  const addCustomer = () => {
    setForm({ ...form, customers: [...form.customers, emptyCustomer()] });
  };

  const removeCustomer = (idx: number) => {
    if (form.customers.length === 1) return;
    setForm({ ...form, customers: form.customers.filter((_, i) => i !== idx) });
  };

  const addEmailOrPhone = (idx: number, field: 'email' | 'phone') => {
    const updated = [...form.customers];
    updated[idx][field] = [...updated[idx][field], ''];
    setForm({ ...form, customers: updated });
  };

  const removeEmailOrPhone = (idx: number, field: 'email' | 'phone', arrIdx: number) => {
    const updated = [...form.customers];
    if (updated[idx][field].length === 1) return;
    updated[idx][field] = updated[idx][field].filter((_, i) => i !== arrIdx);
    setForm({ ...form, customers: updated });
  };

  // Validation helpers
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^\+?[0-9\s\-()]{10,}$/.test(phone);

  // Only use the new API for submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.address || !form.city || !form.state || !form.PIN) {
      alert('Please fill all company fields.');
      return;
    }
    for (const c of form.customers) {
      if (!c.name || !c.position) {
        alert('Please fill all customer name and position fields.');
        return;
      }
      if (c.email.length === 0 || c.email.some((em) => !em.trim() || !validateEmail(em))) {
        alert('Please provide valid email(s) for all customers.');
        return;
      }
      if (c.phone.length === 0 || c.phone.some((ph) => !ph.trim() || !validatePhone(ph))) {
        alert('Please provide valid phone(s) for all customers.');
        return;
      }
    }
    // Prepare payload for new API
    const payload: CreateCompanyWithUsersPayload = {
      companyName: form.companyName,
      address: form.address,
      place: form.place,
      city: form.city,
      state: form.state,
      PIN: form.PIN,
      users: form.customers.map((c) => ({
        name: c.name,
        email: c.email,
        position: c.position,
        phone: c.phone,
      })),
    };
    // Debug log
    console.log('Payload being sent:', payload);
    const token = localStorage.getItem('token');
    try {
      if (initialData && initialData._id) {
        // Edit mode: update existing client/company
        await clientsApi.updateClient(initialData._id, payload);
      } else {
        // Create mode
        await clientsApi.createCompanyWithUsers(payload, token ? token : undefined);
      }
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setForm({
        companyName: '',
        address: '',
        place: '',
        city: '',
        state: '',
        PIN: '',
        customers: [emptyCustomer()],
      });
      onClose();
    } catch (error: any) {
      alert('Failed to save company with users: ' + (error?.response?.data?.message || error.message));
    }
  };

  const isPending = isUpdating;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto !mt-[0px]">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl mx-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{initialData ? 'Edit Customer(s)' : 'Add New Customer(s)'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Company Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Namee *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleCompanyChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="ABC Company"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleCompanyChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                  placeholder="123 Main St"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Place *</label>
              <input
                type="text"
                name="place"
                value={form.place}
                onChange={handleCompanyChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                placeholder="Area/Locality"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleCompanyChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                placeholder="City"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State *</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleCompanyChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                placeholder="State"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PIN *</label>
              <input
                type="text"
                name="PIN"
                value={form.PIN}
                onChange={handleCompanyChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
                placeholder="PIN Code"
                required
              />
            </div>
          </div>

          {/* Customers Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Customer Contacts</h3>
            {form.customers.map((customer, idx) => (
              <div key={idx} className="border rounded-lg p-4 mb-4 relative bg-gray-50">
                {form.customers.length > 1 && (
                  <button
                    type="button"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => removeCustomer(idx)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={customer.name}
                        onChange={e => handleCustomerChange(idx, 'name', e.target.value)}
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
                        value={customer.position}
                        onChange={e => handleCustomerChange(idx, 'position', e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                        placeholder="Position"
                        required
                      />
                    </div>
                  </div>
                </div>
                {/* Emails */}
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email(s) *</label>
                  {customer.email.map((em, emIdx) => (
                    <div key={emIdx} className="flex gap-2 mb-2">
                      <div className="flex-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={em}
                          onChange={e => handleCustomerArrayChange(idx, 'email', emIdx, e.target.value)}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                          placeholder="contact@company.com"
                          required
                        />
                      </div>
                      {customer.email.length > 1 && (
                        <button type="button" onClick={() => removeEmailOrPhone(idx, 'email', emIdx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      )}
                      {emIdx === customer.email.length - 1 && (
                        <button type="button" onClick={() => addEmailOrPhone(idx, 'email')} className="text-green-500 hover:text-green-700"><Plus size={18} /></button>
                      )}
                    </div>
                  ))}
                </div>
                {/* Phones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone(s) *</label>
                  {customer.phone.map((ph, phIdx) => (
                    <div key={phIdx} className="flex gap-2 mb-2">
                      <div className="flex-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={ph}
                          onChange={e => handleCustomerArrayChange(idx, 'phone', phIdx, e.target.value)}
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                          placeholder="Phone Number"
                          required
                        />
                      </div>
                      {customer.phone.length > 1 && (
                        <button type="button" onClick={() => removeEmailOrPhone(idx, 'phone', phIdx)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      )}
                      {phIdx === customer.phone.length - 1 && (
                        <button type="button" onClick={() => addEmailOrPhone(idx, 'phone')} className="text-green-500 hover:text-green-700"><Plus size={18} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              onClick={addCustomer}
            >
              <Plus size={18} /> Add More Customer
            </button>
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
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              disabled={isPending}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 