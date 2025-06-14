import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/auth';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { useComponentInitialization } from '../hooks/useComponentInitialization';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  ImageIcon,
  Package,
  Tag,
  DollarSign,
  Shield,
  Settings,
  ChevronDown,
  Check,
  AlertCircle,
  Edit2,
  Trash2,
  MoreVertical,
  FilterX,
  ArrowUpDown,
  IndianRupee,
  FolderPlus
} from 'lucide-react';
import Select, { MultiValue, ActionMeta } from 'react-select';
import { useProducts } from '../features/products/hooks/useProducts';
import type { Product } from '../features/products/types';
import { useCreateProduct } from '../features/products/hooks/useCreateProduct';
import { AddCategoryModal } from '../features/categories/components/AddCategoryModal';
import { toast } from 'react-hot-toast';
import { animatedComponents } from '../utils/react-select';

// Types
type ProductModel = {
  id: string;
  name: string;
  createdBy: string;
};

type ProductType = {
  id: string;
  name: string;
  createdBy: string;
};

type ProductFeature = {
  id: string;
  name: string;
  createdBy: string;
};

// Mock data for product options
const mockProductModels: ProductModel[] = [
  { id: '1', name: 'Model A', createdBy: 'admin' },
  { id: '2', name: 'Model B', createdBy: 'admin' },
  { id: '3', name: 'Model C', createdBy: 'admin' },
];

const mockProductTypes: ProductType[] = [
  { id: '1', name: 'Type X', createdBy: 'admin' },
  { id: '2', name: 'Type Y', createdBy: 'admin' },
  { id: '3', name: 'Type Z', createdBy: 'admin' },
];

const mockProductFeatures: ProductFeature[] = [
  { id: '1', name: 'Feature 1', createdBy: 'admin' },
  { id: '2', name: 'Feature 2', createdBy: 'admin' },
  { id: '3', name: 'Feature 3', createdBy: 'admin' },
];

// Mock products data
const mockProducts: Product[] = [];

type SelectOption = {
  value: string;
  label: string;
};

function Products() {
  // Use the new initialization hook at the very top
  const { isInitialized, user, isAdmin: isAdminFromHook } = useComponentInitialization();
  
  // More robust admin check
  const isAdmin = user?.role?.toLowerCase()?.trim() === 'admin';
  
  // State for product options
  const [productModels, setProductModels] = useState<ProductModel[]>([
    { id: '1', name: 'Model A', createdBy: 'admin' },
    { id: '2', name: 'Model B', createdBy: 'admin' },
    { id: '3', name: 'Model C', createdBy: 'admin' },
  ]);

  const [productTypes, setProductTypes] = useState<ProductType[]>([
    { id: '1', name: 'Type X', createdBy: 'admin' },
    { id: '2', name: 'Type Y', createdBy: 'admin' },
    { id: '3', name: 'Type Z', createdBy: 'admin' },
  ]);

  const [availableFeatures, setAvailableFeatures] = useState<ProductFeature[]>([
    { id: '1', name: 'Feature 1', createdBy: 'admin' },
    { id: '2', name: 'Feature 2', createdBy: 'admin' },
    { id: '3', name: 'Feature 3', createdBy: 'admin' },
  ]);

  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  
  // State for product form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOptionFormOpen, setIsOptionFormOpen] = useState(false);
  const [selectedOptionType, setSelectedOptionType] = useState<'model' | 'type' | 'feature' | null>(null);
  const [newOptionName, setNewOptionName] = useState('');
  
  // State for Add Category modal
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  // State for product form inputs
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImageFilename, setProductImageFilename] = useState<string>(''); // Stores the filename from successful upload
  const [productTitle, setProductTitle] = useState('');
  const [productModel, setProductModel] = useState('');
  const [productType, setProductType] = useState('');
  const [productFeatures, setProductFeatures] = useState<string[]>([]);
  const [productPrice, setProductPrice] = useState('');
  const [productWarranty, setProductWarranty] = useState('');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);

  // State for pagination and sorting
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { createProduct, uploadImageMutation, isPending: isCreatingProduct } = useCreateProduct();

  // Fetch products using the hook
  const { data, isLoading, error } = useProducts({
    page,
    limit: 10,
    sortBy,
    sortOrder,
  });

  // Debug logging
  console.log('Products component - Debug info:', {
    user,
    userRole: user?.role,
    isAdmin,
    isInitialized
  });
  
  // Don't render anything until auth is initialized
  if (!isInitialized) {
    console.log('Products component: Auth not initialized');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  console.log('Products component: Auth initialized, proceeding with component');
  
  // Debug modal state
  console.log('Modal state:', isAddCategoryModalOpen);
  
  const handleAddCategoryClick = () => {
    console.log('Add Category button clicked!');
    setIsAddCategoryModalOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImageFile(file); // Set the file for preview

      try {
        const uploadResult = await uploadImageMutation.mutateAsync(file);
        setProductImageFilename(uploadResult.filename); // Store the filename from the API response
      } catch (error) {
        console.error('Image upload failed during selection:', error);
        setProductImageFile(null); // Clear the file if upload fails
        setProductImageFilename('');
      }
    }
  };

  const handleAddOption = () => {
    if (!newOptionName.trim()) return;
    
    const newId = (Math.max(...(selectedOptionType === 'model' ? productModels : 
                              selectedOptionType === 'type' ? productTypes : 
                              availableFeatures).map(item => parseInt(item.id))) + 1).toString();
    
    const newOption = {
      id: newId,
      name: newOptionName.trim(),
      createdBy: user?.id || 'admin'
    };

    switch (selectedOptionType) {
      case 'model':
        setProductModels([...productModels, newOption as ProductModel]);
        break;
      case 'type':
        setProductTypes([...productTypes, newOption as ProductType]);
        break;
      case 'feature':
        setAvailableFeatures([...availableFeatures, newOption as ProductFeature]);
        break;
    }

    setNewOptionName('');
    setIsOptionFormOpen(false);
    setSelectedOptionType(null);
  };

  const handleAddProduct = async () => {
    if (!productTitle.trim() || !productModel || !productType || !productPrice || !productWarranty) {
      toast.error('Please fill in all required fields');
      return;
    }

    const productData = {
      title: productTitle.trim(),
      model: productModel.trim(),
      type: productType.trim(),
      features: productFeatures.join(','), // Convert array to comma-separated string
      price: parseFloat(productPrice),
      warranty: productWarranty.trim(),
      productImage: productImageFilename || '',
      category: '6845333f5a9d818c74c66db8', // Using a default category ID
    };

    try {
      await createProduct(productData);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const handleFeatureChange = (
    newValue: MultiValue<SelectOption>,
    actionMeta: ActionMeta<SelectOption>
  ) => {
    setSelectedFeatures(newValue.map(option => option.value));
  };

  const handleProductFeatureChange = (
    newValue: MultiValue<SelectOption>,
    actionMeta: ActionMeta<SelectOption>
  ) => {
    setProductFeatures(newValue.map(option => option.value));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductTitle(product.title);
    setProductModel(product.model);
    setProductType(product.type);
    setProductFeatures(product.features);
    setProductPrice(product.price.toString());
    setProductWarranty(product.warranty);
    setProductImageFilename(product.productImage || '');
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      toast.success('Product deleted successfully');
    }
  };

  const handleUpdateProduct = () => {
    if (!editingProduct || !productTitle.trim() || !productModel || !productType || !productPrice || !productWarranty) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedProduct = {
      ...editingProduct,
      title: productTitle.trim(),
      model: productModel.trim(),
      type: productType.trim(),
      features: productFeatures,
      price: parseFloat(productPrice),
      warranty: productWarranty.trim(),
      productImage: productImageFilename || editingProduct.productImage,
    };

    setProducts(products.map(p => p._id === editingProduct._id ? updatedProduct : p));
    handleCloseModal();
    toast.success('Product updated successfully');
  };

  const handleActionClick = (productId: string) => {
    setActionDropdownOpen(actionDropdownOpen === productId ? null : productId);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setProductTitle('');
    setProductModel('');
    setProductType('');
    setProductFeatures([]);
    setProductPrice('');
    setProductWarranty('');
    setProductImageFile(null);
    setProductImageFilename('');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Debug logging for products data
  console.log('Products hook result:', { data, isLoading, error });

  // Access products and pagination info from the fetched data
  const productsData = data?.products || [];
  const pagination = data?.pagination;

  // Filter products based on search term (local filtering)
  const filteredProductsData = useMemo(() => {
    if (!searchTerm) {
      return productsData;
    }
    return productsData.filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [productsData, searchTerm]);

  // Show loading state
  if (isLoading) {
    console.log('Products page: Loading state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('Products page: Error state', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-2">Error Loading Products</h2>
          <p className="mb-4">Failed to load products. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
          <div className="mt-4 text-xs text-gray-500">
            <p>Error details:</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-left overflow-auto">
              {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  console.log('Products page: Rendering main content');
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <div className="flex items-center space-x-3">
          {/* Add Category Button - Admin Only */}

          {isAdmin && (
            <button
              onClick={handleAddCategoryClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              Add Category
            </button>
          )}
          
          {/* Add Product Button */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative col-span-full md:col-span-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={productsData.length === 0 ? "Add products to enable search" : "Search products by title, model, type, or features..."}
              disabled={productsData.length === 0}
              className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                productsData.length === 0 
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
              productsData.length === 0 ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Products List or Empty State */}
      {productsData.length === 0 && !isLoading && !error ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
              <Package className="w-32 h-32 text-indigo-500 mx-auto relative top-7 z-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Added Yet</h3>
            <p className="text-gray-500 mb-6">
              Start building your product catalog by adding your first product. You can include product details, pricing, and specifications.
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Product
            </button>
          </div>
        </div>
      ) : filteredProductsData.length === 0 && searchTerm ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
              <FilterX className="w-32 h-32 text-indigo-500 mx-auto relative top-9 z-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">
              No products match your search criteria. Try adjusting your search terms.
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FilterX className="w-4 h-4 mr-2" />
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('title')}
                    className="group inline-flex items-center"
                  >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                    <SortIcon field="title" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Features
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('price')}
                    className="group inline-flex items-center"
                  >
                    Price
                    <IndianRupee className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                    <SortIcon field="price" />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warranty
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductsData.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.productImage && (
                        <img
                          src={`http://localhost:3033/uploads/${product.productImage}`}
                          alt={product.title}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {product.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.model}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {product.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.warranty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => handleActionClick(product._id)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {actionDropdownOpen === product._id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => {
                                handleEditProduct(product);
                                setActionDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteProduct(product);
                                setActionDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter product title"
                  />
                </div>

                {/* Product Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {productImageFile && (
                      <img
                        src={URL.createObjectURL(productImageFile)}
                        alt="Preview"
                        className="h-16 w-16 rounded object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Product Model */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Model
                    </label>
                    <input
                      type="text"
                      value={productModel}
                      onChange={(e) => setProductModel(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter product model"
                    />
                  </div>
                </div>

                {/* Product Type */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Type
                    </label>
                    <input
                      type="text"
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter product type"
                    />
                  </div>
                </div>

                {/* Product Features */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Features (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={productFeatures.join(', ')}
                      onChange={(e) => setProductFeatures(e.target.value.split(',').map(f => f.trim()))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter features, e.g., Feature1, Feature2"
                    />
                  </div>
                </div>

                {/* Product Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Price
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      className="w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Product Warranty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Warranty
                  </label>
                  <input
                    type="text"
                    value={productWarranty}
                    onChange={(e) => setProductWarranty(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g., 1 year, 6 months"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                disabled={isCreatingProduct || uploadImageMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isCreatingProduct || uploadImageMutation.isPending) ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    {uploadImageMutation.isPending ? 'Uploading Image...' : (editingProduct ? 'Updating...' : 'Creating...')}
                  </div>
                ) : (
                  editingProduct ? 'Update Product' : 'Add Product'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete "{productToDelete.title}"? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Option Modal (Admin Only) */}
      {isOptionFormOpen && selectedOptionType && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Add New {selectedOptionType.charAt(0).toUpperCase() + selectedOptionType.slice(1)}
              </h3>
              <button
                onClick={() => {
                  setIsOptionFormOpen(false);
                  setSelectedOptionType(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedOptionType.charAt(0).toUpperCase() + selectedOptionType.slice(1)} Name
                </label>
                <input
                  type="text"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder={`Enter ${selectedOptionType} name`}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsOptionFormOpen(false);
                  setSelectedOptionType(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOption}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add {selectedOptionType.charAt(0).toUpperCase() + selectedOptionType.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <AddCategoryModal 
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
      />
    </div>
  );
}

export default Products;