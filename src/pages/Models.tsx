import React, { useState, useEffect } from "react";
import { useComponentInitialization } from "../hooks/useComponentInitialization";
import SearchBar from "../components/SearchBar";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  MoreVertical,
  Package,
  Save,
  Loader2,
} from "lucide-react";
import { useModels, useCreateModel, useUpdateModel, useDeleteModel } from "../features/models/hooks/useModels";
import { toast } from "react-hot-toast";
import type { Model } from "../features/models/types";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

function Models() {
  const { isInitialized } = useComponentInitialization();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  
  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [specifications, setSpecifications] = useState<string>("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<Model | null>(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);

  const { data: modelsData, isLoading, error, refetch } = useModels();
  const createModel = useCreateModel();
  const updateModel = useUpdateModel();
  const deleteModel = useDeleteModel();

  const models = modelsData || [];

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (editingModel) {
      setModelName(editingModel.name);
      setModelDescription(editingModel.description);
      setSpecifications(editingModel.specifications);
    } else {
      setModelName("");
      setModelDescription("");
      setSpecifications("");
    }
  }, [editingModel]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleAddModel = () => {
    setEditingModel(null);
    setIsModalOpen(true);
  };

  const handleEditModel = (model: Model) => {
    setEditingModel(model);
    setIsModalOpen(true);
    setActionDropdownOpen(null);
  };

  const handleDeleteModel = (model: Model) => {
    setModelToDelete(model);
    setIsDeleteModalOpen(true);
    setActionDropdownOpen(null);
  };

  const handleCloseModal = () => {
    if (createModel.isPending || updateModel.isPending) return;
    setIsModalOpen(false);
    setEditingModel(null);
    // Reset form fields
    setModelName("");
    setModelDescription("");
    setSpecifications("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName.trim() || !modelDescription.trim()) {
      toast.error("Please fill in name and description");
      return;
    }

    const modelData = {
      name: modelName.trim(),
      description: modelDescription.trim(),
      specifications,
    };

    try {
      if (editingModel) {
        await updateModel.mutateAsync({ id: editingModel._id, data: modelData });
      } else {
        await createModel.mutateAsync(modelData);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save model:", err);
    }
  };

  const confirmDelete = async () => {
    if (modelToDelete) {
      try {
        await deleteModel.mutateAsync(modelToDelete._id);
        setIsDeleteModalOpen(false);
        setModelToDelete(null);
      } catch (err) {
        console.error("Failed to delete model:", err);
      }
    }
  };
  
  const handleSpecificationChange = (event: any, editor: any) => {
    const data = editor.getData();
    setSpecifications(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-6">
        <h2 className="text-2xl font-bold mb-2">Error Loading Models</h2>
        <button onClick={() => refetch()} className="px-4 py-2 bg-indigo-600 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Models</h1>
        <button onClick={handleAddModel} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          Add Model
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <SearchBar
          placeholder="Search models..."
          onSearch={setSearchTerm}
          debounceMs={500}
          initialValue={searchTerm}
        />
      </div>

      {filteredModels.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-lg shadow">
          <Package className="w-24 h-24 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchTerm ? "No Models Found" : "No models yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "Try a different search term." : "Get started by adding a new model."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specifications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredModels.map((model) => (
                <tr key={model._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{model.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{model.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                     <div dangerouslySetInnerHTML={{ __html: model.specifications }} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(model.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="relative">
                      <button onClick={() => setActionDropdownOpen(actionDropdownOpen === model._id ? null : model._id)} className="text-gray-400">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {actionDropdownOpen === model._id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <button onClick={() => handleEditModel(model)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Edit2 className="h-4 w-4 mr-2" /> Edit
                          </button>
                          <button onClick={() => handleDeleteModel(model)} className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </button>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center pb-4 border-b">
                 <h3 className="text-lg font-medium">{editingModel ? "Edit Model" : "Add New Model"}</h3>
                 <button type="button" onClick={handleCloseModal}><X/></button>
              </div>
              <div className="space-y-4 py-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-3"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={modelDescription} onChange={(e) => setModelDescription(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm p-3"/>
                 </div>
                 <div>
                   <label htmlFor="specifications" className="block text-sm font-medium text-gray-700">Specifications</label>
                   <CKEditor
                     editor={ClassicEditor}
                     data={specifications}
                     onChange={handleSpecificationChange}
                     config={{
                      toolbar: ['undo', 'redo', 'paragraph', 'bold', 'italic'],
                      heading: {
                        options: [
                          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' }
                        ]
                      }
                    }}
                   />
                 </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                 <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white border rounded-md">Cancel</button>
                 <button type="submit" disabled={createModel.isPending || updateModel.isPending} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white border rounded-md disabled:opacity-50">
                   {createModel.isPending || updateModel.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2"/>}
                   {editingModel ? "Update" : "Create"}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && modelToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
             <h3 className="text-lg font-medium">Delete Model</h3>
             <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete "{modelToDelete.name}"?</p>
             <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-white border rounded-md">Cancel</button>
                <button onClick={confirmDelete} disabled={deleteModel.isPending} className="inline-flex items-center px-4 py-2 bg-red-600 text-white border rounded-md disabled:opacity-50">
                   {deleteModel.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                   Delete
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Models; 