import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/auth';
import { 
  Plus, 
  Search, 
  Filter, 
  X, 
  Image as ImageIcon,
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
  FilterX
} from 'lucide-react';
import Select, { MultiValue, ActionMeta } from 'react-select';
import makeAnimated from 'react-select/animated';

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

type Product = {
  id: string;
  image: string;
  title: string;
  description: string;
  model: string;
  type: string;
  features: string[]; // Array of feature IDs
  price: number;
  warranty: number;
  createdBy: string;
  createdAt: Date;
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
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  
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
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [warrantyRange, setWarrantyRange] = useState<[number, number]>([0, 10]);
  
  // State for product form
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productModel, setProductModel] = useState('');
  const [productType, setProductType] = useState('');
  const [productFeatures, setProductFeatures] = useState<string[]>([]);
  const [productPrice, setProductPrice] = useState('');
  const [productWarranty, setProductWarranty] = useState('');

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);

  // Add new state for existing image URL
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');

  const animatedComponents = makeAnimated();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductImage(e.target.files[0]);
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

  const handleAddProduct = () => {
    if (!productTitle.trim() || !productModel || !productType || !productPrice || !productWarranty) {
      return;
    }

    const newProduct: Product = {
      id: (Math.max(...products.map(p => parseInt(p.id)), 0) + 1).toString(),
      image: productImage ? URL.createObjectURL(productImage) : '',
      title: productTitle.trim(),
      description: productDescription.trim(),
      model: productModel,
      type: productType,
      features: productFeatures,
      price: parseFloat(productPrice),
      warranty: parseInt(productWarranty),
      createdBy: user?.id || 'admin',
      createdAt: new Date()
    };

    setProducts([...products, newProduct]);
    setIsFormOpen(false);
    
    // Reset form
    setProductImage(null);
    setExistingImageUrl(''); // Reset existing image URL
    setProductTitle('');
    setProductDescription('');
    setProductModel('');
    setProductType('');
    setProductFeatures([]);
    setProductPrice('');
    setProductWarranty('');
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
    setProductImage(null); // Reset new image upload
    setExistingImageUrl(product.image); // Set existing image URL
    setProductTitle(product.title);
    setProductDescription(product.description);
    setProductModel(product.model);
    setProductType(product.type);
    setProductFeatures(product.features);
    setProductPrice(product.price.toString());
    setProductWarranty(product.warranty.toString());
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleUpdateProduct = () => {
    if (!editingProduct || !productTitle.trim() || !productModel || !productType || !productPrice || !productWarranty) {
      return;
    }

    const updatedProduct: Product = {
      ...editingProduct,
      image: productImage ? URL.createObjectURL(productImage) : existingImageUrl, // Use new image or keep existing
      title: productTitle.trim(),
      description: productDescription.trim(),
      model: productModel,
      type: productType,
      features: productFeatures,
      price: parseFloat(productPrice),
      warranty: parseInt(productWarranty),
    };

    setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
    setIsFormOpen(false);
    setEditingProduct(null);
    
    // Reset form
    setProductImage(null);
    setExistingImageUrl(''); // Reset existing image URL
    setProductTitle('');
    setProductDescription('');
    setProductModel('');
    setProductType('');
    setProductFeatures([]);
    setProductPrice('');
    setProductWarranty('');
  };

  const handleActionClick = (productId: string) => {
    setActionDropdownOpen(actionDropdownOpen === productId ? null : productId);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setProductImage(null);
    setExistingImageUrl(''); // Reset existing image URL
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesModel = !selectedModel || product.model === selectedModel;
      const matchesType = !selectedType || product.type === selectedType;
      const matchesFeatures = selectedFeatures.length === 0 || 
                            selectedFeatures.every(feature => product.features.includes(feature));
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesWarranty = product.warranty >= warrantyRange[0] && product.warranty <= warrantyRange[1];
      
      return matchesSearch && matchesModel && matchesType && matchesFeatures && matchesPrice && matchesWarranty;
    });
  }, [products, searchTerm, selectedModel, selectedType, selectedFeatures, priceRange, warrantyRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={products.length === 0 ? "Add products to enable search" : "Search products..."}
              disabled={products.length === 0}
              className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                products.length === 0 
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${
              products.length === 0 ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </div>

          <div>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={products.length === 0}
              className={`w-full rounded-md border h-[42px] shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                products.length === 0 
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            >
              <option value="">{products.length === 0 ? "No models available" : "All Models"}</option>
              {productModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={products.length === 0}
              className={`w-full rounded-md border h-[42px] shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                products.length === 0 
                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            >
              <option value="">{products.length === 0 ? "No types available" : "All Types"}</option>
              {productTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className='h-[42px]'>
            <Select
              isMulti
              components={animatedComponents}
              options={availableFeatures.map(feature => ({ value: feature.id, label: feature.name }))}
              value={selectedFeatures.map(featureId => ({ 
                value: featureId, 
                label: availableFeatures.find(f => f.id === featureId)?.name || featureId 
              }))}
              onChange={handleFeatureChange}
              isDisabled={products.length === 0}
              className="w-full h-[42px]"
              placeholder={products.length === 0 ? "No features available" : "Select Features"}
              styles={{
                control: (base, state) => ({
                  ...base,
                  backgroundColor: products.length === 0 ? '#F9FAFB' : 'white',
                  borderColor: products.length === 0 ? '#E5E7EB' : state.isFocused ? '#6366F1' : '#D1D5DB',
                  cursor: products.length === 0 ? 'not-allowed' : 'default',
                  '&:hover': {
                    borderColor: products.length === 0 ? '#E5E7EB' : state.isFocused ? '#6366F1' : '#D1D5DB'
                  }
                }),
                placeholder: (base) => ({
                  ...base,
                  color: products.length === 0 ? '#9CA3AF' : '#6B7280'
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: products.length === 0 ? '#F3F4F6' : '#EEF2FF'
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: products.length === 0 ? '#9CA3AF' : '#4338CA'
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: products.length === 0 ? '#9CA3AF' : '#4338CA',
                  ':hover': {
                    backgroundColor: products.length === 0 ? '#E5E7EB' : '#E0E7FF',
                    color: products.length === 0 ? '#9CA3AF' : '#4338CA'
                  }
                })
              }}
            />
          </div>
        </div>
      </div>

      {/* Products List or Empty State */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
              <Package className="w-32 h-32 text-indigo-500 mx-auto relative top-7 z-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Added Yet</h3>
            <p className="text-gray-500 mb-6">
              Start building your product catalog by adding your first product. You can include images, descriptions, and specifications.
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
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
              <FilterX className="w-32 h-32 text-indigo-500 mx-auto relative top-9 z-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">
              No products match your current filter criteria. Try adjusting your filters or search terms.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {selectedModel && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Model: {productModels.find(m => m.id === selectedModel)?.name}
                  <button
                    onClick={() => setSelectedModel('')}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Type: {productTypes.find(t => t.id === selectedType)?.name}
                  <button
                    onClick={() => setSelectedType('')}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {selectedFeatures.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Features: {selectedFeatures.length} selected
                  <button
                    onClick={() => setSelectedFeatures([])}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Price: ${priceRange[0]} - ${priceRange[1]}
                  <button
                    onClick={() => setPriceRange([0, 1000000])}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {(warrantyRange[0] > 0 || warrantyRange[1] < 10) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Warranty: {warrantyRange[0]} - {warrantyRange[1]} years
                  <button
                    onClick={() => setWarrantyRange([0, 10])}
                    className="ml-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedModel('');
                setSelectedType('');
                setSelectedFeatures([]);
                setPriceRange([0, 1000000]);
                setWarrantyRange([0, 10]);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FilterX className="w-4 h-4 mr-2" />
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Model
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Features
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Warranty
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 min-h-[65px]">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{product.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-[200px]" title={product.description}>
                      {product.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[120px]" title={productModels.find(m => m.id === product.model)?.name}>
                      {productModels.find(m => m.id === product.model)?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-[120px]" title={productTypes.find(t => t.id === product.type)?.name}>
                      {productTypes.find(t => t.id === product.type)?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {product.features.map(featureId => {
                        const feature = availableFeatures.find(f => f.id === featureId);
                        return feature ? (
                          <span 
                            key={featureId} 
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full truncate max-w-[180px]"
                            title={feature.name}
                          >
                            {feature.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">${product.price.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{product.warranty} years</div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => handleActionClick(product.id)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {actionDropdownOpen === product.id && (
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
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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

      {/* Add/Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {productImage ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(productImage)}
                          alt="Preview"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setProductImage(null);
                            if (editingProduct) {
                              setExistingImageUrl(editingProduct.image);
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : existingImageUrl ? (
                      <div className="relative">
                        <img
                          src={existingImageUrl}
                          alt="Current"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setExistingImageUrl('')}
                          className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Title */}
              <div>
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

              {/* Product Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter product description"
                />
              </div>

              {/* Product Model */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Model
                  </label>
                  <select
                    value={productModel}
                    onChange={(e) => setProductModel(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Model</option>
                    {productModels.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedOptionType('model');
                      setIsOptionFormOpen(true);
                    }}
                    className="mt-6 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Product Type */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Type</option>
                    {productTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedOptionType('type');
                      setIsOptionFormOpen(true);
                    }}
                    className="mt-6 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Product Features */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Features
                  </label>
                  <Select
                    isMulti
                    components={animatedComponents}
                    options={availableFeatures.map(feature => ({ value: feature.id, label: feature.name }))}
                    value={productFeatures.map(featureId => ({ 
                      value: featureId, 
                      label: availableFeatures.find(f => f.id === featureId)?.name || featureId 
                    }))}
                    onChange={handleProductFeatureChange}
                    className="w-full"
                    placeholder="Select Features"
                  />
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedOptionType('feature');
                      setIsOptionFormOpen(true);
                    }}
                    className="mt-6 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}
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
                  Product Warranty (years)
                </label>
                <input
                  type="number"
                  value={productWarranty}
                  onChange={(e) => setProductWarranty(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter warranty period in years"
                />
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
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
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
    </div>
  );
}

export default Products;