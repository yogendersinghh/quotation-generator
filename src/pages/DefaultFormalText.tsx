import React, { useState } from 'react';
import { useDefaultMessages, useUpdateDefaultMessage } from '../features/defaultMessages/hooks/useDefaultMessages';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FileText, Edit2, X } from 'lucide-react';

function DefaultFormalText() {
  const { data: messages, isLoading, isError } = useDefaultMessages();
  const updateMutation = useUpdateDefaultMessage();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    formalMessage: '',
    notes: '',
    billingDetails: '',
    termsAndConditions: '',
    signatureImage: '',
  });

  const openEditModal = (msg: any) => {
    setEditId(msg._id);
    setForm({
      formalMessage: msg.formalMessage || '',
      notes: msg.notes || '',
      billingDetails: msg.billingDetails || '',
      termsAndConditions: msg.termsAndConditions || '',
      signatureImage: msg.signatureImage || `<p>
            We are confident that the quotation will meet your requirements and
            look forward for your valued order.
          </p>
          <p><strong>Thanking you.</strong></p>
          <p><strong>Yours truly</strong></p>
          <div class="signature-line">
            <strong><%= user ? user.name : 'Sumit Verma' %></strong><br />
            <strong>(M) <%= user ? user.phone : '9810685715' %></strong>
          </div>
          <p style="margin-top: 20px"><strong>Attached: Brochure</strong></p>`
    });
  };

  const closeEditModal = () => {
    setEditId(null);
  };

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    updateMutation.mutate({ id: editId, ...form });
    closeEditModal();
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
  if (isError) return <div className="text-red-500 text-center p-6">Error loading messages.</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 flex gap-3">
          <FileText className="w-8 h-8 text-indigo-500" /> Default Formal Text
        </h1>
      </div>
      <div className="bg-white rounded-lg shadow-md p-8 w-full">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg._id} className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  Formal Message
                </h2>
                <button
                  className="bg-[#F7931E] text-white px-4 py-2 rounded font-medium hover:bg-orange-600 transition-colors flex items-center gap-1"
                  onClick={() => openEditModal(msg)}
                >
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </button>
              </div>
              <div className="mb-6 bg-gray-50 rounded p-4 border border-gray-100">
                <div className="mb-2 text-gray-700" dangerouslySetInnerHTML={{ __html: msg.formalMessage }} />
              </div>
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                Notes
              </h2>
              <div className="mb-6 bg-gray-50 rounded p-4 border border-gray-100">
                <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: msg.notes }} />
              </div>
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                Billing Details
              </h2>
              <div className="mb-6 bg-gray-50 rounded p-4 border border-gray-100">
                <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: msg.billingDetails }} />
              </div>
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                Terms & Conditions
              </h2>
              <div className="bg-gray-50 rounded p-4 border border-gray-100">
                <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: msg.termsAndConditions }} />
              </div>
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2 mt-4">
                Signature Image
              </h2>
              <div className="bg-gray-50 rounded p-4 border border-gray-100">
                <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: msg.signatureImage }} />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-indigo-200" />
            <div className="text-lg font-medium">No formal messages found.</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative animate-slide-up h-[80%] overflow-scroll">
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={closeEditModal}
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Edit2 className="w-6 h-6 text-yellow-500" /> Edit Default Formal Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-semibold mb-1">Formal Message</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={form.formalMessage}
                  onChange={(_, editor) => handleChange('formalMessage', editor.getData())}
                  config={{ toolbar: ['undo', 'redo', 'paragraph', 'bold', 'italic'] }}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Notes</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={form.notes}
                  onChange={(_, editor) => handleChange('notes', editor.getData())}
                  config={{ toolbar: ['undo', 'redo', 'paragraph', 'bold', 'italic'] }}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Billing Details</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={form.billingDetails}
                  onChange={(_, editor) => handleChange('billingDetails', editor.getData())}
                  config={{ toolbar: ['undo', 'redo', 'paragraph', 'bold', 'italic'] }}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Terms & Conditions</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={form.termsAndConditions}
                  onChange={(_, editor) => handleChange('termsAndConditions', editor.getData())}
                  config={{ toolbar: ['undo', 'redo', 'paragraph', 'bold', 'italic'] }}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Signature Image</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={form.signatureImage}
                  onChange={(_, editor) => handleChange('signatureImage', editor.getData())}
                  config={{ toolbar: ['undo', 'redo', 'paragraph', 'bold', 'italic'] }}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DefaultFormalText; 