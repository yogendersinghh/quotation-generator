import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, User, Mail, Briefcase, MapPin, Phone } from 'lucide-react';
import { useCreateClient } from '../hooks/useCreateClient';
import { useUpdateClient } from '../hooks/useUpdateClient';
import { Client, CreateClientPayload } from '../types';

// Define the validation schema for the client form
const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  position: z.string().min(1, 'Position is required'),
  address: z.string().min(1, 'Address is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters').regex(/^\+?[0-9\s\-()]{10,}$/, 'Invalid phone number format'),
});

type ClientFormData = z.infer<typeof clientSchema>;

type ClientFormProps = {
  onClose: () => void;
  initialData?: Client | null; // Optional: for editing existing client
};

export const ClientForm = ({ onClose, initialData }: ClientFormProps) => {
  const { mutate: createClient, isPending: isCreating } = useCreateClient();
  const { mutate: updateClient, isPending: isUpdating } = useUpdateClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData ? { // Populate form with initialData if provided
      name: initialData.name,
      email: initialData.email,
      position: initialData.position,
      address: initialData.address,
      phoneNumber: initialData.phoneNumber,
    } : {},
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        position: initialData.position,
        address: initialData.address,
        phoneNumber: initialData.phoneNumber,
      });
    } else {
      reset(); // Clear form for new client
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ClientFormData) => {
    if (initialData) {
      // Update existing client
      updateClient({ ...initialData, ...data }, {
        onSuccess: () => {
          onClose();
        },
      });
    } else {
      // Create new client
      createClient(data as CreateClientPayload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{initialData ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="position"
                {...register('position')}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Software Engineer"
              />
            </div>
            {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address"
                {...register('address')}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="123 Main St, Anytown, USA"
              />
            </div>
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="phoneNumber"
                {...register('phoneNumber')}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="(123) 456-7890"
              />
            </div>
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {isPending ? (initialData ? 'Updating Customer...' : 'Adding Customer...') : (initialData ? 'Update Customer' : 'Add Customer')}
          </button>
        </form>
      </div>
    </div>
  );
}; 