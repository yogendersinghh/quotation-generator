import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { Plus, FileText, CheckCircle2, Eye, X, FilterX } from 'lucide-react';
import Select, { MultiValue } from 'react-select';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Types
interface CustomerOption { value: string; label: string; }
interface ProductOption { value: string; label: string; }
interface ProductRow { product: ProductOption; qty: string; unit: string; }
interface QuotationItem {
  title: string;
  price: number;
  status: 'Pending';
  pdfUrl: string;
}

// Mock data for customers and products (replace with real data from your store/db)
const mockCustomers: CustomerOption[] = [
  { value: '1', label: 'John Doe' },
  { value: '2', label: 'Jane Smith' }
];
const mockProducts: ProductOption[] = [
  { value: '1', label: 'PAC 20U' },
  { value: '2', label: 'Mouth Piece' },
  { value: '3', label: 'Elbow' }
];

function Quotations() {
  const user = useAuthStore((state) => state.user);
  const { isInitialized } = useAuthContext();
  // const isAdmin = user?.role === 'admin';
  // if (isAdmin) return null;

  // State for quotations (user-specific) - ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [title, setTitle] = useState('');
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [subject, setSubject] = useState('');
  const [formalMessage, setFormalMessage] = useState('');

  // Step 2 fields
  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [machineInstall, setMachineInstall] = useState({ qty: '', unit: '', price: '', total: '' });

  // Step 3 fields
  const [notes, setNotes] = useState('');
  const [billing, setBilling] = useState('');
  const [supply, setSupply] = useState('');
  const [ic, setIC] = useState('');

  // Step 4 fields
  const [tnc, setTnc] = useState('');

  // Step 5 fields
  const [signature, setSignature] = useState<File | null>(null);
  const [signatureUrl, setSignatureUrl] = useState('');

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handlers for product selection
  const handleProductSelect = (options: MultiValue<ProductOption>) => {
    setSelectedProducts(options as ProductOption[]);
    setProductRows((options as ProductOption[]).map(opt => {
      const existing = productRows.find(row => row.product.value === opt.value);
      return existing || { product: opt, qty: '', unit: '' };
    }));
  };
  const handleProductRowChange = (idx: number, field: 'qty' | 'unit', value: string) => {
    setProductRows(rows => rows.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  };

  // Signature upload
  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignature(file);
      setSignatureUrl(URL.createObjectURL(file));
    }
  };

  // Calculate total price
  const calculatePrice = () => {
    let total = 0;
    productRows.forEach(row => {
      const qty = parseFloat(row.qty) || 0;
      // For demo, assume each product is 10000 (replace with real price lookup)
      total += qty * 10000;
    });
    const miQty = parseFloat(machineInstall.qty) || 0;
    const miPrice = parseFloat(machineInstall.price) || 0;
    total += miQty * miPrice;
    return total;
  };

  // PDF generation (simple Blob for demo)
  const handleGeneratePDF = () => {
    // For demo, just create a simple text PDF
    const pdfContent = `Quotation Title: ${title}\nPrice: ${calculatePrice()}\nStatus: Pending`;
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    setQuotations(prev => [
      ...prev,
      {
        title,
        price: calculatePrice(),
        status: 'Pending',
        pdfUrl
      }
    ]);
    setIsFormOpen(false);
    setStep(1);
    // Reset form fields
    setTitle(''); setCustomer(null); setSubject(''); setFormalMessage('');
    setSelectedProducts([]); setProductRows([]); setMachineInstall({ qty: '', unit: '', price: '', total: '' });
    setNotes(''); setBilling(''); setSupply(''); setIC(''); setTnc(''); setSignature(null); setSignatureUrl('');
  };

  // Modal close handler
  const handleCloseModal = () => {
    setIsFormOpen(false);
    setStep(1);
    setTitle(''); setCustomer(null); setSubject(''); setFormalMessage('');
    setSelectedProducts([]); setProductRows([]); setMachineInstall({ qty: '', unit: '', price: '', total: '' });
    setNotes(''); setBilling(''); setSupply(''); setIC(''); setTnc(''); setSignature(null); setSignatureUrl('');
  };

  // Quotation Table UI
  const QuotationTable = () => (
    <div className="bg-white rounded-lg shadow mt-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {quotations.map((q, idx) => (
            <tr key={idx} className="hover:bg-gray-50 min-h-[65px]">
              <td className="px-6 py-4 font-medium text-gray-900">{q.title}</td>
              <td className="px-6 py-4">₹ {q.price.toLocaleString()}</td>
              <td className="px-6 py-4">
                <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">{q.status}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <a href={q.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  <Eye className="w-4 h-4 mr-1" /> View PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Empty state UI
  const EmptyState = () => (
    <div className="bg-white rounded-lg shadow p-12 text-center mt-8">
      <div className="max-w-md mx-auto">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
          <FilterX className="w-32 h-32 text-indigo-500 mx-auto relative top-7 z-10" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotations Available</h3>
        <p className="text-gray-500 mb-6">
          You have not created any quotations yet. Start by creating your first quotation.
        </p>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Quotation
        </button>
      </div>
    </div>
  );

  // Multi-step form modal UI (always mounted, only visible when open)
  const QuotationFormModal = (
    <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 ${isFormOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Create Quotation</h3>
          <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500"><X className="w-6 h-6" /></button>
        </div>
        <div className="px-6 py-4">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${step === s ? 'bg-indigo-600' : 'bg-gray-300'}`}>{s}</div>
              ))}
            </div>
            <span className="text-gray-500">Step {step} of 5</span>
          </div>
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <Select<CustomerOption, false>
                  options={mockCustomers}
                  value={customer}
                  onChange={(option) => setCustomer(option as CustomerOption)}
                  placeholder="Select customer"
                  isClearable
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Formal Message</label>
                <CKEditor editor={ClassicEditor as any} data={formalMessage} onChange={(_, editor: any) => setFormalMessage(editor.getData())} />
              </div>
            </div>
          )}
          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Products</label>
                <Select<ProductOption, true>
                  isMulti
                  options={mockProducts}
                  value={selectedProducts}
                  onChange={handleProductSelect}
                  placeholder="Select products"
                />
              </div>
              {productRows.length > 0 && (
                <table className="w-full mt-4 border rounded">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1">Product</th>
                      <th className="px-2 py-1">Qty</th>
                      <th className="px-2 py-1">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productRows.map((row, idx) => (
                      <tr key={row.product.value}>
                        <td className="px-2 py-1">{row.product.label}</td>
                        <td className="px-2 py-1"><input type="number" min="1" value={row.qty} onChange={e => handleProductRowChange(idx, 'qty', e.target.value)} className="w-20 border rounded px-2 py-1" /></td>
                        <td className="px-2 py-1"><input type="text" value={row.unit} onChange={e => handleProductRowChange(idx, 'unit', e.target.value)} className="w-20 border rounded px-2 py-1" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Installation</label>
                <div className="flex gap-2">
                  <input type="number" min="0" placeholder="Qty" value={machineInstall.qty} onChange={e => setMachineInstall({ ...machineInstall, qty: e.target.value })} className="w-20 border rounded px-2 py-1" />
                  <input type="text" placeholder="Unit" value={machineInstall.unit} onChange={e => setMachineInstall({ ...machineInstall, unit: e.target.value })} className="w-20 border rounded px-2 py-1" />
                  <input type="number" min="0" placeholder="Price" value={machineInstall.price} onChange={e => setMachineInstall({ ...machineInstall, price: e.target.value })} className="w-24 border rounded px-2 py-1" />
                  <input type="number" min="0" placeholder="Total" value={machineInstall.total} onChange={e => setMachineInstall({ ...machineInstall, total: e.target.value })} className="w-24 border rounded px-2 py-1" />
                </div>
              </div>
            </div>
          )}
          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <CKEditor editor={ClassicEditor as any} data={notes} onChange={(_, editor: any) => setNotes(editor.getData())} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Billing Details</label>
                <CKEditor editor={ClassicEditor as any} data={billing} onChange={(_, editor: any) => setBilling(editor.getData())} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supply</label>
                  <input type="text" value={supply} onChange={e => setSupply(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">I&C</label>
                  <input type="text" value={ic} onChange={e => setIC(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>
            </div>
          )}
          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                <CKEditor editor={ClassicEditor as any} data={tnc} onChange={(_, editor: any) => setTnc(editor.getData())} />
              </div>
            </div>
          )}
          {/* Step 5 */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Signature Upload</label>
                <input type="file" accept="image/*" onChange={handleSignatureChange} />
                {signatureUrl && <img src={signatureUrl} alt="Signature" className="mt-4 h-24" />}
              </div>
            </div>
          )}
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {step < 5 ? (
              <button
                onClick={() => setStep(s => Math.min(5, s + 1))}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleGeneratePDF}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Generate PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Main page layout
  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Quotations</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Quotation
        </button>
      </div>
      {quotations.length === 0 ? <EmptyState /> : <QuotationTable />}
      {QuotationFormModal}
    </div>
  );
}

export default Quotations;