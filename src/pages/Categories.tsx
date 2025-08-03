import React, { useState } from "react";
import { useComponentInitialization } from "../hooks/useComponentInitialization";
import SearchBar from "../components/SearchBar";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  MoreVertical,
  FolderPlus,
  AlertCircle,
  Save,
  Loader2,
} from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../features/categories/hooks/useCategories";
import { toast } from "react-hot-toast";
import type { Category } from "../features/categories/types";

function Categories() {
  // Use the initialization hook
  const { isInitialized, user, isAdmin: isAdminFromHook } = useComponentInitialization();
  
  // More robust admin check
  const isAdmin = user?.role?.toLowerCase()?.trim() === "admin" ||
    user?.role?.toLowerCase()?.trim() === "administrator" ||
    isAdminFromHook;

  // State for search
  const [searchTerm, setSearchTerm] = useState("");

  // State for add/edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  // State for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // State for action dropdown
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);

  // Fetch categories
  const { data: categoriesData, isLoading, error, refetch } = useCategories({
    limit: 100,
    enabled: true,
  });

  // Mutations
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Get categories array
  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.categories || [];

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Don't render until auth is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setIsModalOpen(true);
    setActionDropdownOpen(null);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
    setActionDropdownOpen(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim() || !categoryDescription.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory._id,
          data: {
            name: categoryName.trim(),
            description: categoryDescription.trim(),
          },
        });
      } else {
        await createCategory.mutateAsync({
          name: categoryName.trim(),
          description: categoryDescription.trim(),
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleCloseModal = () => {
    if (!createCategory.isPending && !updateCategory.isPending) {
      setIsModalOpen(false);
      setEditingCategory(null);
      setCategoryName("");
      setCategoryDescription("");
    }
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory.mutateAsync(categoryToDelete._id);
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  const handleActionClick = (categoryId: string) => {
    setActionDropdownOpen(actionDropdownOpen === categoryId ? null : categoryId);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold mb-2">Error Loading Categories</h2>
          <p className="mb-4">Failed to load categories. Please try again later.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <button
          onClick={handleAddCategory}
          className="bg-[#F7931E] text-white px-4 py-2 rounded font-medium hover:bg-orange-600 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <SearchBar
          placeholder="Search categories by name or description..."
          onSearch={setSearchTerm}
          debounceMs={500}
          initialValue={searchTerm}
        />
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-6">
                              <div className="absolute inset-0 bg-orange-100 rounded-full opacity-20 animate-pulse"></div>
                              <FolderPlus className="w-32 h-32 text-orange-500 mx-auto relative top-7 z-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No Categories Found" : "No Categories Added Yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "No categories match your search criteria. Try adjusting your search terms."
                : "Start organizing your products by adding your first category."}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddCategory}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Category
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {category.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => handleActionClick(category._id)}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {actionDropdownOpen === category._id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              role="menuitem"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category)}
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

      {/* Add/Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 !mt-0">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={createCategory.isPending || updateCategory.isPending}
                className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  disabled={createCategory.isPending || updateCategory.isPending}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Category Description */}
              <div>
                <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="category-description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Enter category description"
                  rows={3}
                  disabled={createCategory.isPending || updateCategory.isPending}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={createCategory.isPending || updateCategory.isPending}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategory.isPending || updateCategory.isPending || !categoryName.trim() || !categoryDescription.trim()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createCategory.isPending || updateCategory.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingCategory ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingCategory ? "Update Category" : "Create Category"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 !mt-0">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Delete Category</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete "{categoryToDelete.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                disabled={deleteCategory.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteCategory.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteCategory.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories; 