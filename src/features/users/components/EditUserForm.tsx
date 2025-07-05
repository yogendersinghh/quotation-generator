import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UpdateUserData } from '../api';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { User as UserType } from '../hooks/useUsers';
import { X, User, Mail, Lock, Shield, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../lib/axios';

// Define the validation schema for the update user form
const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').min(1, 'Email is required').optional(),
  // Password should not be pre-filled or required for update unless explicitly provided
  // For password changes, a separate form/flow is often recommended.
  role: z.enum(['admin', 'manager'], { required_error: 'Role is required' }).optional(),
  userStatus: z.enum(['active', 'blocked'], { required_error: 'User status is required' }).optional(),
  signature: z.string().optional(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

type EditUserFormProps = {
  user: UserType;
  onClose: () => void;
};

export const EditUserForm = ({ user, onClose }: EditUserFormProps) => {
  const { mutate: updateUser, isPending } = useUpdateUser();
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string>("");
  const [signatureFilename, setSignatureFilename] = useState<string>("");

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role as any,
      userStatus: user.userStatus as any,
    },
  });

  // Set form values when the user prop changes (e.g., initial load or user selection)
  useEffect(() => {
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role as any);
    setValue('userStatus', user.userStatus as any);
  }, [user, setValue]);

  const onSubmit = async (data: UpdateUserFormData) => {
    const updateData = { ...data };
    if (signatureFilename) {
      updateData.signature = signatureFilename;
    }
    
    updateUser({
      userId: user._id,
      userData: updateData,
    }, {
      onSuccess: () => {
        setSignatureFile(null);
        setSignaturePreview("");
        setSignatureFilename("");
        onClose();
      },
    });
  };

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
  ];

  const userStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'blocked', label: 'Blocked' },
  ];

  // Add signature upload function
  const uploadSignature = async (file: File) => {
    const formData = new FormData();
    formData.append('signature', file);
    const response = await apiClient.post('/api/upload/signature', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.filename;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit User</h2>
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
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
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
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* Password field removed for edit form - typically handled separately or not allowed */}

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="role"
                {...register('role')}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 sm:text-sm border-gray-300 rounded-md"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
          </div>

          <div>
            <label htmlFor="userStatus" className="block text-sm font-medium text-gray-700">User Status</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle2 className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="userStatus"
                {...register('userStatus')}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 sm:text-sm border-gray-300 rounded-md"
              >
                {userStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.userStatus && <p className="mt-1 text-sm text-red-600">{errors.userStatus.message}</p>}
          </div>

          <div>
            <label htmlFor="signature" className="block text-sm font-medium text-gray-700">Signature</label>
            <input
              type="file"
              id="signature"
              accept="image/*"
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setSignatureFile(file);
                  setSignaturePreview(URL.createObjectURL(file));
                  try {
                    // Upload signature image and set filename
                    const uploadedFilename = await uploadSignature(file);
                    setSignatureFilename(uploadedFilename);
                  } catch (error) {
                    console.error('Failed to upload signature:', error);
                    alert('Failed to upload signature. Please try again.');
                  }
                }
              }}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {signaturePreview && (
              <img src={signaturePreview} alt="Signature Preview" className="mt-2 h-16 border rounded" />
            )}
            {!signaturePreview && <p className="text-xs text-gray-400 mt-1">Upload a new signature image (optional)</p>}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {isPending ? 'Updating user...' : 'Update User'}
          </button>
        </form>
      </div>
    </div>
  );
}; 