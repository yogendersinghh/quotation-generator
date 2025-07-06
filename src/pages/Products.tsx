import React, { useState, useMemo, useEffect } from "react";
import { useComponentInitialization } from "../hooks/useComponentInitialization";
import SearchBar from "../components/SearchBar";
import {
  Plus,
  X,
  Package,
  Edit2,
  Trash2,
  MoreVertical,
  FilterX,
  ArrowUpDown,
  IndianRupee,
  FolderPlus,
} from "lucide-react";
import { useProducts } from "../features/products/hooks/useProducts";
import { useProduct } from "../features/products/hooks/useProduct";
import type { Product } from "../features/products/types";
import { useCreateProduct } from "../features/products/hooks/useCreateProduct";
import { useUpdateProduct } from "../features/products/hooks/useUpdateProduct";
import { useDeleteProduct } from "../features/products/hooks/useDeleteProduct";
import { toast } from "react-hot-toast";
import { useCategories } from "../features/categories/hooks/useCategories";
import { useModels } from "../features/models/hooks/useModels";
import { Link, useNavigate } from "react-router-dom";
import type { Model } from "../features/models/types";
import Select from "react-select";

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

function Products() {
  const navigate = useNavigate();
  
  // Use the new initialization hook at the very top
  const {
    isInitialized,
    user,
    isAdmin: isAdminFromHook,
  } = useComponentInitialization();

  // More robust admin check - check multiple variations
  const isAdmin =
    user?.role?.toLowerCase()?.trim() === "admin" ||
    user?.role?.toLowerCase()?.trim() === "administrator" ||
    isAdminFromHook;

  // State for product options
  const [productModels, setProductModels] = useState<ProductModel[]>([
    { id: "1", name: "Model A", createdBy: "admin" },
    { id: "2", name: "Model B", createdBy: "admin" },
    { id: "3", name: "Model C", createdBy: "admin" },
  ]);

  const [productTypes, setProductTypes] = useState<ProductType[]>([
    { id: "1", name: "Type X", createdBy: "admin" },
    { id: "2", name: "Type Y", createdBy: "admin" },
    { id: "3", name: "Type Z", createdBy: "admin" },
  ]);

  const [availableFeatures, setAvailableFeatures] = useState<ProductFeature[]>([
    { id: "1", name: "Feature 1", createdBy: "admin" },
    { id: "2", name: "Feature 2", createdBy: "admin" },
    { id: "3", name: "Feature 3", createdBy: "admin" },
  ]);

  // State for products
  const [products, setProducts] = useState<Product[]>([]);

  // State for product form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOptionFormOpen, setIsOptionFormOpen] = useState(false);
  const [selectedOptionType, setSelectedOptionType] = useState<
    "model" | "type" | "feature" | null
  >(null);
  const [newOptionName, setNewOptionName] = useState("");

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // State for product form inputs
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImageFilename, setProductImageFilename] = useState<string>(""); // Stores the filename from successful upload
  const [productTitle, setProductTitle] = useState("");
  const [productModel, setProductModel] = useState("");
  const [productType, setProductType] = useState("");
  const [productFeatures, setProductFeatures] = useState<string[]>([]);
  const [productPrice, setProductPrice] = useState("");
  const [productWarranty, setProductWarranty] = useState("");
  const [description, setDescription] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(
    null
  );

  // State for pagination and sorting
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    createProduct,
    uploadImageMutation,
    isPending: isCreatingProduct,
  } = useCreateProduct();

  const { updateProduct, isUpdating: isUpdatingProduct } = useUpdateProduct();
  const { deleteProduct, isDeleting: isDeletingProduct } = useDeleteProduct();

  // Fetch products using the hook
  const { data, isLoading, error } = useProducts({
    page,
    limit: 10,
    sortBy,
    sortOrder,
    title: searchTerm,
    model: modelFilter,
    categories: categoryFilter.join(','),
  } as any);

  // Fetch single product for editing
  const { data: editingProductData } = useProduct(
    editingProductId || '',
    !!editingProductId
  );

  // Fetch models for model select
  const { data: modelsData, isLoading: isLoadingModels } = useModels();
  const modelOptions =
    modelsData?.map((model: Model) => ({
      value: model._id,
      label: model.name,
    })) || [];

  // Fetch categories for categories select
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories({
    limit: 100,
    enabled: true, // Explicitly enable the query
  });

  // Debug logging for categories
  console.log("Categories hook result:", {
    categoriesData,
    isCategoriesLoading,
    categoriesError,
    categoryOptions: Array.isArray(categoriesData)
      ? categoriesData.map((cat: any) => ({ value: cat._id, label: cat.name }))
      : (categoriesData?.categories || []).map((cat: any) => ({
          value: cat._id,
          label: cat.name,
        })),
  });

  const categoryOptions = Array.isArray(categoriesData)
    ? categoriesData.map((cat: any) => ({ value: cat._id, label: cat.name }))
    : (categoriesData?.categories || []).map((cat: any) => ({
        value: cat._id,
        label: cat.name,
      }));

  // State for selected categories and notes
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  // Add state for new fields
  const [quality, setQuality] = useState("");
  const [specification, setSpecification] = useState("");
  const [termsAndCondition, setTermsAndCondition] = useState("");

  // Refetch categories when modal opens
  useEffect(() => {
    if (isFormOpen) {
      console.log("Modal opened, refetching categories...");
      refetchCategories();
    }
  }, [isFormOpen, refetchCategories]);

  // Populate form when editing product data is loaded
  useEffect(() => {
    if (editingProductData && editingProduct) {
      console.log("Populating form with product data:", editingProductData);
      const product = editingProductData;
      
      setProductTitle(product.title);
      setProductModel(typeof product.model === 'object' ? (product.model as any)._id : product.model);
      setProductFeatures(product.features);
      setProductPrice(product.price.toString());
      setProductWarranty(product.warranty);
      setProductImageFilename(product.productImage || "");
      
      if (Array.isArray(product.categories)) {
        setSelectedCategories(
          product.categories.map((cat: any) =>
            typeof cat === "object" && cat !== null ? (cat as any)._id : cat
          )
        );
      } else if (product.categories) {
        setSelectedCategories([product.categories]);
      } else {
        setSelectedCategories([]);
      }
      
      setNotes(product.notes || "");
      setDescription((product as any).description || "");
      setQuality(product.quality || "");
      setSpecification(product.specification || "");
      setTermsAndCondition(product.termsAndCondition || "");
    }
  }, [editingProductData, editingProduct]);

  // Debug logging
  console.log("Products component - Debug info:", {
    user,
    userRole: user?.role,
    userRoleRaw: user?.role,
    userRoleLowerCase: user?.role?.toLowerCase(),
    userRoleTrimmed: user?.role?.trim(),
    isAdmin,
    isAdminFromHook,
    isInitialized,
  });

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    console.log("Products component: Auth not initialized");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  console.log(
    "Products component: Auth initialized, proceeding with component"
  );

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProductImageFile(file); // Set the file for preview

      try {
        const uploadResult = await uploadImageMutation.mutateAsync(file);
        setProductImageFilename(uploadResult.filename); // Store the filename from the API response
      } catch (error) {
        console.error("Image upload failed during selection:", error);
        setProductImageFile(null); // Clear the file if upload fails
        setProductImageFilename("");
      }
    }
  };

  const handleAddOption = () => {
    if (!newOptionName.trim()) return;

    const newId = (
      Math.max(
        ...(selectedOptionType === "model"
          ? productModels
          : selectedOptionType === "type"
          ? productTypes
          : availableFeatures
        ).map((item) => parseInt(item.id))
      ) + 1
    ).toString();

    const newOption = {
      id: newId,
      name: newOptionName.trim(),
      createdBy: user?.id || "admin",
    };

    switch (selectedOptionType) {
      case "model":
        setProductModels([...productModels, newOption as ProductModel]);
        break;
      case "type":
        setProductTypes([...productTypes, newOption as ProductType]);
        break;
      case "feature":
        setAvailableFeatures([
          ...availableFeatures,
          newOption as ProductFeature,
        ]);
        break;
    }

    setNewOptionName("");
    setIsOptionFormOpen(false);
    setSelectedOptionType(null);
  };

  const handleAddProduct = async () => {

    if (
      !productTitle.trim() ||
      !productModel ||
      !productPrice ||
      !productWarranty ||
      selectedCategories.length === 0
    ) {
      toast.error("Please fill in all required fields");
      return;
    }


    const productData: any = {
      title: productTitle.trim(),
      model: productModel.trim(),
      features: productFeatures.join(","), // Convert array to comma-separated string
      price: parseFloat(productPrice),
      warranty: productWarranty.trim(),
      productImage: productImageFilename || "",
      categories: selectedCategories,
      notes: notes.trim(),
      description: description.trim(),
      quality: quality.trim(),
      specification: specification.trim(),
      termsAndCondition: termsAndCondition.trim(),
    };

    try {
      await createProduct(productData);
      handleCloseModal();
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product._id);
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete._id);
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const handleUpdateProduct = async () => {
    if (
      !editingProduct ||
      !productTitle.trim() ||
      !productModel ||
      !productPrice ||
      !productWarranty
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const productData: any = {
      title: productTitle.trim(),
      model: productModel.trim(),
      features: productFeatures.join(","),
      price: parseFloat(productPrice),
      warranty: productWarranty.trim(),
      productImage: productImageFilename || "",
      categories: selectedCategories,
      notes: notes.trim(),
      description: description.trim(),
      quality: quality.trim(),
      specification: specification.trim(),
      termsAndCondition: termsAndCondition.trim(),
    };

    try {
      await updateProduct({ id: editingProduct._id, productData });
      handleCloseModal();
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleActionClick = (productId: string) => {
    setActionDropdownOpen(actionDropdownOpen === productId ? null : productId);
  };

  const handleCloseModal = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setEditingProductId(null);
    setProductTitle("");
    setProductModel("");
    setProductFeatures([]);
    setProductPrice("");
    setProductWarranty("");
    setProductImageFile(null);
    setProductImageFilename("");
    setSelectedCategories([]);
    setNotes("");
    setDescription("");
    setQuality("");
    setSpecification("");
    setTermsAndCondition("");
    refetchCategories();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Debug logging for products data
  console.log("Products hook result:", { data, isLoading, error });

  // Access products and pagination info from the fetched data
  const productsData = data?.products || [];
  const pagination = data?.pagination;

  const hasActiveFilters = searchTerm || modelFilter || categoryFilter.length > 0;

  // Show loading state
  if (isLoading) {
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
    console.error("Products page: Error state", error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-2">Error Loading Products</h2>
          <p className="mb-4">
            Failed to load products. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
          <div className="mt-4 text-xs text-gray-500">
            <p>Error details:</p>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-left overflow-auto">
              {error instanceof Error
                ? error.message
                : JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  console.log("Products page: Rendering main content");
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Products</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button 
            onClick={() => navigate('/categories')}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Categories
          </button>
          <button 
            onClick={() => navigate('/models')}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Models
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          <div className="relative col-span-full md:col-span-1">
            <SearchBar
              placeholder={
                productsData.length === 0 && !hasActiveFilters
                  ? "Add products to enable search"
                  : "Search by title..."
              }
              onSearch={setSearchTerm}
              debounceMs={500}
              disabled={productsData.length === 0 && !hasActiveFilters}
              initialValue={searchTerm}
            />
          </div>

          {/* Model Filter */}
          <div>
            <Select
              options={modelOptions}
              value={modelOptions.find((o) => o.value === modelFilter) || null}
              onChange={(option) => setModelFilter(option ? option.value : "")}
              isLoading={isLoadingModels}
              placeholder="Filter by model"
              isClearable
            />
          </div>

          {/* Category Filter */}
          <div>
            <Select
              isMulti
              options={categoryOptions}
              value={categoryOptions.filter(o => categoryFilter.includes(o.value))}
              onChange={(options) =>
                setCategoryFilter(options ? options.map(o => o.value) : [])
              }
              isLoading={isCategoriesLoading}
              placeholder="Filter by categories"
            />
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              onClick={() => {
                setSearchTerm("");
                setModelFilter("");
                setCategoryFilter([]);
              }}
              disabled={!hasActiveFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed w-full justify-center"
            >
              <FilterX className="w-4 h-4 mr-2" />
              Clear Filters
            </button>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Products Added Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start building your product catalog by adding your first product.
              You can include product details, pricing, and specifications.
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
      ) : productsData.length === 0 && hasActiveFilters ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
              <FilterX className="w-32 h-32 text-indigo-500 mx-auto relative top-9 z-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-500 mb-6">
              No products match your search criteria. Try adjusting your search
              terms.
            </p>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setModelFilter("");
                  setCategoryFilter([]);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FilterX className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm font-sans">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Image</th>
                <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Title</th>
                <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Description</th>
                <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Notes</th>
                <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Specification</th>
                <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Model</th>
                <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>
                <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Warranty</th>
                <th className="px-2 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>
                <th className="px-2 sm:px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsData.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-6 py-3 whitespace-nowrap text-center">
                    {product.productImage ? (
                      <img
                        src={`https://cms-be.yogendersingh.tech/public/products/${product.productImage}`}
                        alt={product.title}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="px-2 sm:px-6 py-3 whitespace-nowrap font-medium text-gray-900">{product.title}</td>
                  <td className="px-2 sm:px-6 py-3 text-sm text-gray-500 max-w-xs truncate" title={product.description}>{product.description}</td>
                  <td className="px-2 sm:px-6 py-3 text-sm text-gray-500 max-w-xs truncate" title={product.notes}>{product.notes}</td>
                  <td className="px-2 sm:px-6 py-3 text-sm text-gray-500 max-w-xs truncate" title={product.specification}>{product.specification}</td>
                  <td className="px-2 sm:px-6 py-3 text-sm text-gray-500">
                    {typeof product.model === 'object' && product.model !== null ? (product.model as any).name : product.model}
                  </td>
                  <td className="px-2 sm:px-6 py-3 text-sm text-gray-500">
                    {Array.isArray(product.categories)
                      ? product.categories.map(cat => typeof cat === 'object' && cat !== null ? (cat as any).name : cat).join(', ')
                      : product.categories}
                  </td>
                  <td className="px-2 sm:px-6 py-3 text-sm text-gray-500">{product.warranty}</td>
                  <td className="px-2 sm:px-6 py-3 text-sm text-gray-500">{formatPrice(product.price)}</td>
                  <td className="px-2 sm:px-6 py-3 text-right text-sm font-medium">
                    <div className="relative action-dropdown">
                      <button
                        onClick={() => handleActionClick(product._id)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {actionDropdownOpen === product._id && (
                        <div className="fixed right-[24px] mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div
                            className="py-1"
                            role="menu"
                            aria-orientation="vertical"
                          >
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 !mt-[0px]">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="flex flex-col gap-[32px]">
                {/* Product Title */}
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                    placeholder="Enter product title"
                  />
                </div>

                {/* Product Image */}
                <div className="">
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
                    {/* Show existing image when editing */}
                    {editingProduct && productImageFilename && !productImageFile && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={`https://cms-be.yogendersingh.tech/public/products/${productImageFilename}`}
                          alt="Current Product Image"
                          className="h-16 w-16 rounded object-cover border"
                        />
                        <span className="text-xs text-gray-500">Current Image</span>
                      </div>
                    )}
                    {/* Show preview of newly uploaded file */}
                    {productImageFile && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={URL.createObjectURL(productImageFile)}
                          alt="New Image Preview"
                          className="h-16 w-16 rounded object-cover border"
                        />
                        <span className="text-xs text-gray-500">New Image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                    placeholder="Enter description (optional)"
                    rows={3}
                  />
                </div>

                {/* Notes Textarea */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                    placeholder="Enter notes (optional)"
                    rows={3}
                  />
                </div>

                {/* Category Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select
                    isMulti
                    options={categoryOptions}
                    value={categoryOptions.filter(o => selectedCategories.includes(o.value))}
                    onChange={(options) =>
                      setSelectedCategories(options ? options.map(o => o.value) : [])
                    }
                    isLoading={isCategoriesLoading}
                    placeholder="Select product categories"
                  />
                </div>

                {/* Product Model */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Model
                    </label>
                    <Select
                      options={modelOptions}
                      value={modelOptions.find(o => o.value === productModel) || null}
                      onChange={(option) =>
                        setProductModel(option ? option.value : "")
                      }
                      isLoading={isLoadingModels}
                      placeholder="Select product model"
                      isClearable
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
                      value={productFeatures.join(", ")}
                      onChange={(e) =>
                        setProductFeatures(
                          e.target.value.split(",").map((f) => f.trim())
                        )
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                      placeholder="Enter features, e.g., Feature1, Feature2"
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
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
                    placeholder="e.g., 1 year, 6 months"
                  />
                </div>

                {/* Product Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Price
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
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

                {/* Quality */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Quality</label>
                  <input
                    type="text"
                    value={quality}
                    onChange={e => setQuality(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 sm:text-sm"
                    placeholder="e.g. Premium Grade"
                  />
                </div>

                {/* Specification */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Specification</label>
                  <textarea
                    value={specification}
                    onChange={e => setSpecification(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 sm:text-sm"
                    placeholder="e.g. Input: 230V AC, Output: 230V AC, Power: 10KVA"
                    rows={2}
                  />
                </div>

                {/* Terms and Condition */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Terms and Condition</label>
                  <textarea
                    value={termsAndCondition}
                    onChange={e => setTermsAndCondition(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 sm:text-sm"
                    placeholder="e.g. Standard warranty terms apply. Installation not included."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* cancel and add button  */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={
                  editingProduct ? handleUpdateProduct : handleAddProduct
                }
                disabled={isCreatingProduct || uploadImageMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingProduct || uploadImageMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    {uploadImageMutation.isPending
                      ? "Uploading Image..."
                      : editingProduct
                      ? "Updating..."
                      : "Creating..."}
                  </div>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 !mt-[0px]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Product
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete "{productToDelete.title}"? This
                action cannot be undone.
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
                disabled={isDeletingProduct}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingProduct ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Option Modal (Admin Only) */}
      {isOptionFormOpen && selectedOptionType && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 !mt-[0px]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Add New{" "}
                {selectedOptionType.charAt(0).toUpperCase() +
                  selectedOptionType.slice(1)}
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
                  {selectedOptionType.charAt(0).toUpperCase() +
                    selectedOptionType.slice(1)}{" "}
                  Name
                </label>
                <input
                  type="text"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
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
                Add{" "}
                {selectedOptionType.charAt(0).toUpperCase() +
                  selectedOptionType.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
