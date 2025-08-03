import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/auth";
import { useAuthContext } from "../features/auth/context/AuthContext";
import { CheckCircle2, X } from "lucide-react";
import Select, { MultiValue } from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate, useParams } from "react-router-dom";
import { useClients } from "../features/clients/hooks/useClients";
import { useProducts } from "../features/products/hooks/useProducts";
import { useCategories } from "../features/categories/hooks/useCategories";
import { tokenStorage } from "../features/auth/utils";
import { apiClient } from "../lib/axios";
import { useDefaultMessages } from '../features/defaultMessages/hooks/useDefaultMessages';
import { useRef } from 'react';

// Types
interface CustomerOption {
  value: string;
  label: string;
  companyCode?: string;
}
interface ProductOption {
  value: string;
  label: string;
  image?: string;
  description?: string;
  notes?: string;
  make?: string;
  model?: string;
  price?: number;
  warranty?: string;
  quality?: string;
  specification?: string;
  termsAndCondition?: string;
  features?: string[];
}
interface ProductRow {
  product: ProductOption;
  qty: string;
  unit: string;
}

export interface Product {
  _id: string;
  productImage: string;
  title: string;
  // ...other fields
}

const CMS_BASE_URL = import.meta.env.VITE_CMS_BASE_URL;

// Custom upload adapter for CKEditor
function SignatureUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return {
      upload: async () => {
        const file = await loader.file;
        const formData = new FormData();
        formData.append('signature', file);
        const response = await apiClient.post('/api/upload/signature', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const filename = response.data.filename;
        return {
          default: `${CMS_BASE_URL}/public/signatures/${filename}`
        };
      }
    };
  };
}

function CreateQuotation() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const { isInitialized } = useAuthContext();
  const navigate = useNavigate();

  // State for multi-step form
  const [step, setStep] = useState(1);
  // Step 1 fields
  const [title, setTitle] = useState("");
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [subject, setSubject] = useState("");
  const [formalMessage, setFormalMessage] = useState("");
  // Step 2: Category selection for filtering products
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({ limit: 100 });
  console.log("🚀 ~ CreateQuotation ~ categoriesData:", categoriesData)
  // Fix categoryOptions extraction
  const categoryOptions = Array.isArray(categoriesData)
    ? categoriesData.map((cat: any) => ({ value: cat._id, label: cat.name }))
    : [];
  // Step 2 fields
  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductOption[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<ProductOption[]>(
    []
  );
  const [machineInstall, setMachineInstall] = useState({
    qty: "",
    unit: "",
    price: "",
    total: "",
  });
  // Step 3 fields
  const [notes, setNotes] = useState("");
  const [billing, setBilling] = useState("");
  const [supply, setSupply] = useState("");
  const [ic, setIC] = useState("");
  // Step 4 fields
  const [tnc, setTnc] = useState("");
  // Step 5 fields
  const [signatureHtml, setSignatureHtml] = useState("");
  // GST option for 5th step
  const [addGst, setAddGst] = useState(false);
  const [gstPercentage, setGstPercentage] = useState("20");

  // Enhancement: Display options for product info
  const [displayOptions, setDisplayOptions] = useState<{
    [productId: string]: "name" | "image";
  }>({});
  const [customNotes, setCustomNotes] = useState<{
    [productId: string]: string;
  }>({});

  const [isEditLoading, setIsEditLoading] = useState(false);
  const [showMore, setShowMore] = useState<{ [productId: string]: boolean }>(
    {}
  );

  // Add state to track which optional fields are included for each product
  const [includedFields, setIncludedFields] = useState<{
    [productId: string]: { [field: string]: boolean };
  }>({});

  // Add state to track edited make/model per product row
  const [editedFields, setEditedFields] = useState<{
    [productId: string]: { make?: string; model?: string };
  }>({});

  // Add state to track edited optional fields per product row
  const [editedOptionals, setEditedOptionals] = useState<{ [productId: string]: { [field: string]: string } }>({});
  
  // Add state to track edited specifications for related and suggested products
  const [editedRelatedSpecs, setEditedRelatedSpecs] = useState<{ [productId: string]: string }>({});
  const [editedSuggestedSpecs, setEditedSuggestedSpecs] = useState<{ [productId: string]: string }>({});

  // Helper to toggle a field for a product
  function toggleField(productId: string, field: string) {
    setIncludedFields((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: !prev[productId]?.[field],
      },
    }));
  }

  function handleEditField(
    productId: string,
    field: "make" | "model",
    value: string
  ) {
    setEditedFields((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  }

  function handleEditOptional(productId: string, field: string, value: string) {
    setEditedOptionals(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  }

  const { data: clientsData, isLoading: clientsLoading } = useClients({
    limit: 1000,
  }); // adjust limit as needed
  const customerOptions: CustomerOption[] = (clientsData?.clients || []).map(
    (client) => ({
      value: client._id,
      label: `${client.name}${client.companyCode ? ` (${client.companyCode})` : ''}`,
      companyCode: client.companyCode,
    })
  );

  // Update useProducts to filter by selectedCategory
  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 1000,
    ...(selectedCategory ? { categories: selectedCategory } : {}),
  });
  // --- Update productOptions mapping ---
  const productOptions: ProductOption[] = (productsData?.products || []).map(
    (product) => ({
      value: product._id,
      label: product.title,
      image: product.productImage ? `${CMS_BASE_URL}/public/products/${product.productImage}` : undefined,
      description: product.description || "",
      notes: product.notes || "",
      make: isNameObject(product.make) ? product.make.name : product.make || "",
      model: isNameObject(product.model)
        ? product.model.name
        : product.model || "",
      price: product.price,
      warranty: product.warranty || "",
      quality: product.quality || "",
      specification: product.specification || "",
      termsAndCondition: product.termsAndCondition || "",
      features: Array.isArray(product.features) ? product.features : [],
    })
  );

  const { data: defaultMessages, isLoading: isDefaultLoading } = useDefaultMessages();

  useEffect(() => {
    if (
      defaultMessages &&
      defaultMessages.length > 0 &&
      !id // Only set defaults if not editing
    ) {
      const msg = defaultMessages[0];
      if (msg.formalMessage && !formalMessage) setFormalMessage(msg.formalMessage);
      if (msg.notes && !notes) setNotes(msg.notes);
      if (msg.billingDetails && !billing) setBilling(msg.billingDetails);
      if (msg.termsAndConditions && !tnc) setTnc(msg.termsAndConditions);
      if (msg.signatureImage && !signatureHtml) setSignatureHtml(msg.signatureImage);
    }
  }, [defaultMessages, id]);

  // Fetch quotation for edit mode
  useEffect(() => {
    if (!id) return;
    setIsEditLoading(true);
    apiClient
      .get(`/api/quotations/${id}`)
      .then((res) => {
        const data = res.data;
        setTitle(data.title || "");
        setCustomer(
          data.client
            ? { value: data.client._id, label: `${data.client.name}${data.client.companyCode ? ` (${data.client.companyCode})` : ''}`, companyCode: data.client.companyCode }
            : null
        );
        setSubject(data.subject || "");
        setFormalMessage(data.formalMessage || "");
        setNotes(data.notes || "");
        setBilling(data.billingDetails || "");
        setSupply(data.supply || "");
        setIC(data.installationAndCommissioning || "");
        setTnc(data.termsAndConditions || "");
        setSignatureHtml(data.signatureImage || ""); // Ensure this is always set from fetched data
        setMachineInstall({
          qty: data.machineInstallation?.quantity?.toString() || "",
          unit: data.machineInstallation?.unit || "",
          price: data.machineInstallation?.price?.toString() || "",
          total: data.machineInstallation?.total?.toString() || "",
        });
        // Store products for mapping after productOptions is loaded
        setFetchedProducts(data.products || []);
        // Store related and suggested products for mapping
        setFetchedRelatedProducts(data.relatedProducts || []);
        setFetchedSuggestedProducts(data.suggestedProducts || []);
        setAddGst(data.GST || false);
        setGstPercentage(data.gstPercentage || "20");

      })
      .catch(() => alert("Failed to fetch quotation details."))
      .finally(() => setIsEditLoading(false));
  }, [id]);

  // Map fetched products to productOptions for Select
  const [fetchedProducts, setFetchedProducts] = useState<any[]>([]);
  const [fetchedRelatedProducts, setFetchedRelatedProducts] = useState<
    string[]
  >([]);
  const [fetchedSuggestedProducts, setFetchedSuggestedProducts] = useState<
    string[]
  >([]);
  useEffect(() => {
    if (!id || !productsData || !fetchedProducts.length) return;
    // Map fetched product IDs to productOptions
    const selected = fetchedProducts
      .map((p) => productOptions.find((opt) => opt.value === p.product._id))
      .filter(Boolean);
    setSelectedProducts(selected as ProductOption[]);
    // --- Update productRows mapping ---
    setProductRows(
      fetchedProducts.map((p) => {
        const opt = productOptions.find((opt) => opt.value === p.product._id);
        return {
          product: opt || {
            value: p.product._id,
            label: p.product.title,
            image: p.product.productImage,
            description: p.product.description || "",
            notes: p.product.notes || "",
            make: isNameObject(p.product.make)
              ? p.product.make.name
              : p.product.make || "",
            model: isNameObject(p.product.model)
              ? p.product.model.name
              : p.product.model || "",
            price: p.product.price,
            warranty: p.product.warranty || "",
            quality: p.product.quality || "",
            specification: p.product.specification || "",
            termsAndCondition: p.product.termsAndCondition || "",
            features: Array.isArray(p.product.features)
              ? p.product.features
              : [],
          },
          qty: p.quantity?.toString() || "",
          unit: p.unit || "",
        };
      })
    );
  }, [id, productsData, fetchedProducts]);

  // Map fetched related and suggested products
  useEffect(() => {
    if (!id || !productsData) return;

    // Map related products
    const related = fetchedRelatedProducts
      .map((productId) => productOptions.find((opt) => opt.value === productId))
      .filter(Boolean);
    setRelatedProducts(related as ProductOption[]);

    // Map suggested products
    const suggested = fetchedSuggestedProducts
      .map((productId) => productOptions.find((opt) => opt.value === productId))
      .filter(Boolean);
    setSuggestedProducts(suggested as ProductOption[]);
  }, [id, productsData, fetchedRelatedProducts, fetchedSuggestedProducts]);

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show loading spinner if editing and loading
  if (isEditLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handlers for product selection
  const handleProductSelect = (options: MultiValue<ProductOption>) => {
    setSelectedProducts(options as ProductOption[]);
    setProductRows(
      (options as ProductOption[]).map((opt) => {
        const existing = productRows.find(
          (row) => row.product.value === opt.value
        );
        return existing || { product: opt, qty: "", unit: "" };
      })
    );
  };
  const handleProductRowChange = (
    idx: number,
    field: "qty" | "unit",
    value: string
  ) => {
    setProductRows((rows) =>
      rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  // Calculate total price
  const calculatePrice = () => {
    let total = 0;
    productRows.forEach((row) => {
      const qty = parseFloat(row.qty) || 0;
      // For demo, assume each product is 10000 (replace with real price lookup)
      total += qty * 10000;
    });
    const miQty = parseFloat(machineInstall.qty) || 0;
    const miPrice = parseFloat(machineInstall.price) || 0;
    total += miQty * miPrice;
    return total;
  };

  // Generate quotation and store data
  const handleGeneratePDF = async () => {
    try {
      // Get authentication token
      const token = tokenStorage.getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Validate mandatory fields
      const mandatoryFields = {
        title: title?.trim(),
        customer: customer?.value,
        subject: subject?.trim(),
        formalMessage: formalMessage?.trim(),
        products: productRows.length > 0,
        notes: notes?.trim(),
        billing: billing?.trim(),
        supply: supply?.trim(),
        ic: ic?.trim(),
        tnc: tnc?.trim(),
      };

      const missingFields = Object.entries(mandatoryFields)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingFields.length > 0) {
        alert(`Please fill in all mandatory fields: ${missingFields.join(', ')}`);
        return;
      }

      // Prepare products data
      const products = productRows.map((row) => {
        const price = typeof row.product.price === "number" ? row.product.price : 0;
        const qty = parseFloat(row.qty) || 0;
        return {
          product: row.product.value,
          title: row.product.label,
          model: row.product.model,
          image: row.product.image,
          specification: editedOptionals[row.product.value]?.specification ?? row.product.specification ?? "",
          quantity: parseInt(row.qty) || 0,
          unit: row.unit,
          price,
          total: qty * price
        };
      });

      // Prepare machine installation data (optional)
      const machineInstallation = (machineInstall.qty || machineInstall.unit || machineInstall.price || machineInstall.total) ? {
        quantity: parseInt(machineInstall.qty) || 0,
        unit: machineInstall.unit,
        price: parseFloat(machineInstall.price) || 0,
        total: parseFloat(machineInstall.total) || 0,
      } : null;

      // Generate quotation reference number (you might want to implement a proper generator)
      const quotationRefNumber = `QT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Prepare the request payload
      const quotationData: any = {
        quotationRefNumber,
        title: title,
        client: customer?.value,
        subject: subject,
        formalMessage: formalMessage,
        products,
        notes: notes,
        billingDetails: billing,
        supply: supply,
        installationAndCommissioning: ic,
        termsAndConditions: tnc,
        totalAmount: calculatePrice(),
        GST: addGst,
        gstPercentage: parseFloat(gstPercentage) || 0,
      };

      // Add optional fields only if they have values
      if (machineInstallation) {
        quotationData.machineInstallation = machineInstallation;
      }

      if (signatureHtml?.trim()) {
        quotationData.signatureImage = signatureHtml;
      }

      if (relatedProducts.length > 0) {
        quotationData.relatedProducts = relatedProducts.map((p) => ({
          product: p.value,
          model: p.model,
          image: p.image,
          specification: editedRelatedSpecs[p.value] ?? p.specification ?? ""
        }));
      }

      if (suggestedProducts.length > 0) {
        quotationData.suggestedProducts = suggestedProducts.map((p) => ({
          product: p.value,
          model: p.model,
          image: p.image,
          specification: editedSuggestedSpecs[p.value] ?? p.specification ?? ""
        }));
      }

      console.log("Sending quotation data to API:", quotationData);

      let result;
      if (id) {
        // Update quotation (now using POST)
        const response = await apiClient.post(
          `/api/quotations/${id}`,
          quotationData
        );
        result = response.data;
      } else {
        // Create quotation
        const response = await apiClient.post("/api/quotations", quotationData);
        result = response.data;
      }
      console.log("Quotation saved successfully:", result);
      navigate("/quotations");
    } catch (error) {
      console.log("🚀 ~ handleGeneratePDF ~ error:", error);
      // Enhanced error logging
      const err = error as any;
      if (err.response) {
        console.error("API error response:", err.response.data);
        const errorMessage = err.response.data?.message || 
                           err.response.data?.error || 
                           `Server error: ${err.response.status} - ${err.response.statusText}`;
        alert(`Failed to save quotation: ${errorMessage}`);
      } else if (err.request) {
        console.error("Network error:", err.request);
        alert("Network error: Unable to connect to the server. Please check your internet connection and try again.");
      } else {
        console.error("Error saving quotation:", err);
        alert(`Error saving quotation: ${err.message || 'An unexpected error occurred. Please try again.'}`);
      }
    }
  };

  // Helper type guard
  function isNameObject(val: any): val is { name: string } {
    return (
      val &&
      typeof val === "object" &&
      "name" in val &&
      typeof val.name === "string"
    );
  }

  // Main page layout
  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create Quotation
        </h1>
        <button
          onClick={() => navigate("/quotations")}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="w-5 h-5 mr-2" /> Cancel
        </button>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                step === s ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        <span className="text-gray-500">Step {step} of 5</span>
      </div>
      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quotation Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <Select<CustomerOption, false>
              options={customerOptions}
              value={customer}
              onChange={(option) => setCustomer(option as CustomerOption)}
              placeholder={
                clientsLoading ? "Loading customers..." : "Select customer"
              }
              isClearable
              isLoading={clientsLoading}
              filterOption={(option, inputValue) => {
                const label = option.label.toLowerCase();
                const input = inputValue.toLowerCase();
                const companyCode = option.data.companyCode?.toLowerCase() || '';
                
                return label.includes(input) || companyCode.includes(input);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quotation Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formal Message
            </label>
            <CKEditor
              editor={ClassicEditor}
              data={formalMessage}
              onChange={(_, editor) => setFormalMessage(editor.getData())}
              config={{
                toolbar: ["undo", "redo", "paragraph", "bold", "italic"],
                heading: {
                  options: [
                    {
                      model: "paragraph",
                      title: "Paragraph",
                      class: "ck-heading_paragraph",
                    },
                  ],
                },
              }}
            />
          </div>
        </div>
      )}
      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Category
            </label>
            <Select
              options={categoryOptions}
              value={categoryOptions.find((o: any) => o.value === selectedCategory) || null}
              onChange={(option) => setSelectedCategory(option ? option.value : null)}
              isLoading={categoriesLoading}
              placeholder={categoriesLoading ? "Loading categories..." : "Select category"}
              isClearable
            />
          </div>
          {/* Product Dropdown (filtered by category) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Products
            </label>
            <Select<ProductOption, true>
              isMulti
              options={productOptions}
              value={selectedProducts}
              onChange={handleProductSelect}
              placeholder={productsLoading ? "Loading products..." : "Select products"}
              isLoading={productsLoading}
              isDisabled={!selectedCategory}
            />
          </div>
          {productRows.length > 0 && (
            <table className="w-full mt-4 border rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Serial No.</th>
                  <th className="px-2 py-1 text-left">Model</th>
                  <th className="px-2 py-1 text-left">Image</th>
                  <th className="px-2 py-1 text-left">Specification</th>
                  <th className="px-2 py-1 text-left">Qty</th>
                  <th className="px-2 py-1 text-left">Unit</th>
                  <th className="px-2 py-1 text-left">Price</th>
                  <th className="px-2 py-1 text-left">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {productRows.map((row, idx) => {
                  const product = row.product;
                  const price = typeof product.price === "number" ? product.price : 0;
                  const qty = parseFloat(row.qty) || 0;
                  const total = price * qty;
                  return (
                    <tr key={product.value} className="border-b border-grey">
                      <td className="px-2 py-1">{idx + 1}</td>
                      <td className="px-2 py-1">{product.model}</td>
                      <td className="px-2 py-1">
                        {product.image ? (
                              <img
                            src={product.image}
                            alt="Product"
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ) : (
                          <span className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-400">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1">
                        <textarea
                          className="w-full border rounded px-2 py-1"
                          rows={2}
                          value={
                            (editedOptionals[product.value]?.specification ?? (product.specification || ""))
                          }
                          onChange={e =>
                            setEditedOptionals(prev => ({
                              ...prev,
                              [product.value]: {
                                ...prev[product.value],
                                specification: e.target.value
                              }
                            }))
                          }
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          min="1"
                          value={row.qty}
                          onChange={e => handleProductRowChange(idx, "qty", e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={row.unit}
                          onChange={e => handleProductRowChange(idx, "unit", e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-2 py-1">₹{price.toLocaleString()}</td>
                      <td className="px-2 py-1">₹{total.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Machine Installation
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                placeholder="Qty"
                value={machineInstall.qty}
                onChange={(e) =>
                  setMachineInstall({
                    ...machineInstall,
                    qty: e.target.value,
                  })
                }
                className="w-[100%] border rounded px-2 py-1"
              />
              <input
                type="text"
                placeholder="Unit"
                value={machineInstall.unit}
                onChange={(e) =>
                  setMachineInstall({
                    ...machineInstall,
                    unit: e.target.value,
                  })
                }
                className="w-[100%] border rounded px-2 py-1"
              />
              <input
                type="number"
                min="0"
                placeholder="Price"
                value={machineInstall.price}
                onChange={(e) =>
                  setMachineInstall({
                    ...machineInstall,
                    price: e.target.value,
                  })
                }
                className="w-[100%] border rounded px-2 py-1"
              />
              <input
                type="number"
                min="0"
                placeholder="Total"
                value={machineInstall.total}
                onChange={(e) =>
                  setMachineInstall({
                    ...machineInstall,
                    total: e.target.value,
                  })
                }
                className="w-[100%] border rounded px-2 py-1"
              />
            </div>
          </div>
        </div>
      )}
      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <CKEditor
              editor={ClassicEditor as any}
              data={notes}
              onChange={(_, editor: any) => setNotes(editor.getData())}
              config={{
                toolbar: ["undo", "redo", "paragraph", "bold", "italic"],
                heading: {
                  options: [
                    {
                      model: "paragraph",
                      title: "Paragraph",
                      class: "ck-heading_paragraph",
                    },
                  ],
                },
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Details
            </label>
            <CKEditor
              editor={ClassicEditor as any}
              data={billing}
              onChange={(_, editor: any) => setBilling(editor.getData())}
              config={{
                toolbar: ["undo", "redo", "paragraph", "bold", "italic"],
                heading: {
                  options: [
                    {
                      model: "paragraph",
                      title: "Paragraph",
                      class: "ck-heading_paragraph",
                    },
                  ],
                },
              }}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supply
              </label>
              <input
                type="text"
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I&C
              </label>
              <input
                type="text"
                value={ic}
                onChange={(e) => setIC(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>
      )}
      {/* Step 4 */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <CKEditor
              editor={ClassicEditor as any}
              data={tnc}
              onChange={(_, editor: any) => setTnc(editor.getData())}
              config={{
                toolbar: ["undo", "redo", "paragraph", "bold", "italic"],
                heading: {
                  options: [
                    {
                      model: "paragraph",
                      title: "Paragraph",
                      class: "ck-heading_paragraph",
                    },
                  ],
                },
              }}
            />
          </div>
        </div>
      )}
      {/* Step 5 */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Products (Max 5)
            </label>
            <Select<ProductOption, true>
              isMulti
              options={productOptions}
              value={relatedProducts}
              onChange={(options) => {
                const limitedOptions = (options as ProductOption[]).slice(0, 5);
                setRelatedProducts(limitedOptions);
              }}
              placeholder={productsLoading ? "Loading products..." : "Select related products (max 5)"}
              isLoading={productsLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Selected: {relatedProducts.length}/5</p>
            {relatedProducts.length > 0 && (
              <table className="w-full mt-4 border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left">S No.</th>
                    <th className="px-2 py-1 text-left">Image</th>
                    <th className="px-2 py-1 text-left">Model</th>
                    <th className="px-2 py-1 text-left">Specification</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedProducts.map((product, idx) => {
                    return (
                      <tr key={product.value} className="border-b border-grey">
                        <td className="px-2 py-1">{idx + 1}</td>
                        <td className="px-2 py-1">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt="Product"
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ) : (
                            <span className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-400">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1">{product.model}</td>
                        <td className="px-2 py-1">
                          <textarea
                            className="w-full border rounded px-2 py-1"
                            rows={2}
                            value={
                              (editedRelatedSpecs[product.value] ?? (product.specification || ""))
                            }
                            onChange={e =>
                              setEditedRelatedSpecs(prev => ({
                                ...prev,
                                [product.value]: e.target.value
                              }))
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggested Products (Max 5)
            </label>
            <Select<ProductOption, true>
              isMulti
              options={productOptions}
              value={suggestedProducts}
              onChange={(options) => {
                const limitedOptions = (options as ProductOption[]).slice(0, 5);
                setSuggestedProducts(limitedOptions);
              }}
              placeholder={productsLoading ? "Loading products..." : "Select suggested products (max 5)"}
              isLoading={productsLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Selected: {suggestedProducts.length}/5</p>
            {suggestedProducts.length > 0 && (
              <table className="w-full mt-4 border rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left">S No.</th>
                    <th className="px-2 py-1 text-left">Image</th>
                    <th className="px-2 py-1 text-left">Model</th>
                    <th className="px-2 py-1 text-left">Specification</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestedProducts.map((product, idx) => {
                    return (
                      <tr key={product.value} className="border-b border-grey">
                        <td className="px-2 py-1">{idx + 1}</td>
                        <td className="px-2 py-1">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt="Product"
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ) : (
                            <span className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-400">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1">{product.model}</td>
                        <td className="px-2 py-1">
                          <textarea
                            className="w-full border rounded px-2 py-1"
                            rows={2}
                            value={
                              (editedSuggestedSpecs[product.value] ?? (product.specification || ""))
                            }
                            onChange={e =>
                              setEditedSuggestedSpecs(prev => ({
                                ...prev,
                                [product.value]: e.target.value
                              }))
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signature (Rich Text)
            </label>
            <CKEditor
              editor={ClassicEditor}
              data={signatureHtml}
              onChange={(_, editor) => setSignatureHtml(editor.getData())}
              config={{
                toolbar: [
                  "undo", "redo", "paragraph", "bold", "italic", "link", "bulletedList", "numberedList",
                  "imageUpload", "imageResize", "imageStyle:full", "imageStyle:side"
                ],
                image: {
                  toolbar: [
                    'imageTextAlternative',
                    'imageStyle:full',
                    'imageStyle:side',
                    'imageResize',
                  ],
                  resizeUnit: '%',
                  resizeOptions: [
                    {
                      name: 'resizeImage:original',
                      value: null,
                      label: 'Original'
                    },
                    {
                      name: 'resizeImage:50',
                      value: '50',
                      label: '50%'
                    },
                    {
                      name: 'resizeImage:75',
                      value: '75',
                      label: '75%'
                    }
                  ]
                },
                extraPlugins: [SignatureUploadAdapterPlugin],
              }}
            />
            <p className="text-xs text-gray-500 mt-2">Add your company signature, contact details, etc. here.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <input
                id="add-gst-checkbox"
                type="checkbox"
                checked={addGst}
                onChange={e => setAddGst(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="add-gst-checkbox" className="ml-2 block text-sm text-gray-700">
                Add GST
              </label>
            </div>
            {addGst && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Percentage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={gstPercentage}
                    onChange={(e) => setGstPercentage(e.target.value)}
                    className="w-32 border rounded-md px-3 py-2"
                    placeholder="20"
                  />
                  <span className="text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the GST percentage to be applied to the quotation
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        {step < 5 ? (
          <button
            onClick={() => setStep((s) => Math.min(5, s + 1))}
            className="bg-[#F7931E] text-white px-4 py-2 rounded font-medium hover:bg-orange-600 transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleGeneratePDF}
            className="bg-[#F7931E] text-white px-4 py-2 rounded font-medium hover:bg-orange-600 transition-colors"
            title=""
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Generate Quotation
          </button>
        )}
      </div>
    </div>
  );
}

export default CreateQuotation;
