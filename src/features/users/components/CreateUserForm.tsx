import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RegisterCredentials } from '../api';
import { useCreateUser } from '../hooks/useCreateUser';
import { X, User, Mail, Lock, Shield, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../../lib/axios';

// Define the validation schema for the registration form
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string(),
  role: z.enum(['admin', 'manager'], { required_error: 'Role is required' }),
  userStatus: z.enum(['active', 'blocked'], { required_error: 'User status is required' }),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

type CreateUserFormProps = {
  onClose: () => void;
};

export const CreateUserForm = ({ onClose }: CreateUserFormProps) => {
  const { mutate: createUser, isPending } = useCreateUser();
  const [showPassword, setShowPassword] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string>("");
  const [signatureFilename, setSignatureFilename] = useState<string>("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const onSubmit = async (data: CreateUserFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Signature filename:', signatureFilename);
    console.log('Form errors:', errors);
    
    if (!signatureFilename) {
      alert('Signature is required');
      return;
    }
    
    console.log('Calling createUser with:', { ...data, signature: signatureFilename });
    createUser({ ...data, signature: signatureFilename }, {
      onSuccess: () => {
        console.log('User created successfully');
        reset();
        setSignatureFile(null);
        setSignaturePreview("");
        setSignatureFilename("");
        onClose();
      },
      onError: (error) => {
        console.error('Error creating user:', error);
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
    console.log('Uploading signature file:', file.name);
    const formData = new FormData();
    formData.append('signature', file);
    try {
      const response = await apiClient.post('/api/upload/signature', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Signature upload response:', response.data);
      return response.data.filename;
    } catch (error) {
      console.error('Signature upload error:', error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New User</h2>
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
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
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
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-3"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...register('password')}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

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
                <option value="">Select a role</option>
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
                <option value="">Select a status</option>
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
            <label htmlFor="signature" className="block text-sm font-medium text-gray-700">Signature *</label>
            <input
              type="file"
              id="signature"
              accept="image/*"
              onChange={async (e) => {
                console.log('File input changed:', e.target.files);
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  console.log('Selected file:', file.name, file.size);
                  setSignatureFile(file);
                  setSignaturePreview(URL.createObjectURL(file));
                  try {
                    // Upload signature image and set filename
                    const uploadedFilename = await uploadSignature(file);
                    console.log('Uploaded filename:', uploadedFilename);
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
            {!signaturePreview && <p className="text-xs text-gray-400 mt-1">Upload a signature image (required)</p>}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPending}
          >
            {isPending ? 'Creating user...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}; 