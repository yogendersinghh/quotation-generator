import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, User, Mail, Briefcase, MapPin, Phone, Plus, Trash2, Building } from 'lucide-react';
import { useCreateClient } from '../hooks/useCreateClient';
import { useUpdateClient } from '../hooks/useUpdateClient';
import { Client, CreateClientPayload } from '../types';

// Define the validation schema for the client form
const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.string().min(1, 'Position is required'),
  address: z.string().min(1, 'Address is required'),
  place: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  PIN: z.string().optional(),
  companyName: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

type ClientFormProps = {
  onClose: () => void;
  initialData?: Client | null; // Optional: for editing existing client
};

export const ClientForm = ({ onClose, initialData }: ClientFormProps) => {
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();
  
  const [emails, setEmails] = useState<string[]>(['']);
  const [phones, setPhones] = useState<string[]>(['']);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        position: initialData.position,
        address: initialData.address,
        place: initialData.place || '',
        city: initialData.city || '',
        state: initialData.state || '',
        PIN: initialData.PIN || '',
        companyName: initialData.companyName || '',
      });
      setEmails(initialData.email.length > 0 ? initialData.email : ['']);
      setPhones(initialData.phone.length > 0 ? initialData.phone : ['']);
    } else {
      reset({
        name: '',
        position: '',
        address: '',
        place: '',
        city: '',
        state: '',
        PIN: '',
        companyName: '',
      });
      setEmails(['']);
      setPhones(['']);
    }
  }, [initialData, reset]);

  const addEmail = () => {
    setEmails([...emails, '']);
  };

  const removeEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addPhone = () => {
    setPhones([...phones, '']);
  };

  const removePhone = (index: number) => {
    if (phones.length > 1) {
      setPhones(phones.filter((_, i) => i !== index));
    }
  };

  const updatePhone = (index: number, value: string) => {
    const newPhones = [...phones];
    newPhones[index] = value;
    setPhones(newPhones);
  };

  const validateEmails = (emails: string[]): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every(email => email === '' || emailRegex.test(email));
  };

  const validatePhones = (phones: string[]): boolean => {
    const phoneRegex = /^\+?[0-9\s\-()]{10,}$/;
    return phones.every(phone => phone === '' || phoneRegex.test(phone));
  };

  const onSubmit = async (data: ClientFormData) => {
    // Filter out empty emails and phones
    const validEmails = emails.filter(email => email.trim() !== '');
    const validPhones = phones.filter(phone => phone.trim() !== '');

    if (validEmails.length === 0) {
      alert('At least one email is required');
      return;
    }

    if (validPhones.length === 0) {
      alert('At least one phone number is required');
      return;
    }

    if (!validateEmails(validEmails)) {
      alert('Please enter valid email addresses');
      return;
    }

    if (!validatePhones(validPhones)) {
      alert('Please enter valid phone numbers');
      return;
    }

    const payload: CreateClientPayload = {
      ...data,
      email: validEmails,
      phone: validPhones,
    };

    if (initialData) {
      // Update existing client
      updateClient({ clientId: initialData._id, payload }, {
        onSuccess: () => {
          onClose();
        },
      });
    } else {
      // Create new client
      createClient(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl mx-4 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{initialData ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position *</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="position"
                  {...register('position')}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Manager"
                />
              </div>
              {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>}
            </div>
          </div>

          {/* Company Information */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="companyName"
                {...register('companyName')}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="ABC Company"
              />
            </div>
          </div>

          {/* Email Addresses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses *</label>
            {emails.map((email, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="flex-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="john@company.com"
                  />
                </div>
                {emails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEmail(index)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addEmail}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Email
            </button>
          </div>

          {/* Phone Numbers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Numbers *</label>
            {phones.map((phone, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <div className="flex-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => updatePhone(index, e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="+919876543210"
                  />
                </div>
                {phones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhone(index)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addPhone}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Phone
            </button>
          </div>

          {/* Address Information */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address *</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address"
                {...register('address')}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="123 Main Street"
              />
            </div>
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="place" className="block text-sm font-medium text-gray-700">Place</label>
              <input
                type="text"
                id="place"
                {...register('place')}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Downtown"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                id="city"
                {...register('city')}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Mumbai"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                id="state"
                {...register('state')}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <label htmlFor="PIN" className="block text-sm font-medium text-gray-700">PIN Code</label>
              <input
                type="text"
                id="PIN"
                {...register('PIN')}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="400001"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPending}
            >
              {isPending ? (initialData ? 'Updating Customer...' : 'Adding Customer...') : (initialData ? 'Update Customer' : 'Add Customer')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 