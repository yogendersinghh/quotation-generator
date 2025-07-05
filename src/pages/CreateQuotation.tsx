import React, { useState } from "react";
import { useAuthStore } from "../store/auth";
import { useAuthContext } from "../features/auth/context/AuthContext";
import { CheckCircle2, X } from "lucide-react";
import Select, { MultiValue } from "react-select";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";
import { useClients } from "../features/clients/hooks/useClients";
import { useProducts } from "../features/products/hooks/useProducts";
import { tokenStorage } from "../features/auth/utils";
import { apiClient } from "../lib/axios";

// Types
interface CustomerOption {
  value: string;
  label: string;
}
interface ProductOption {
  value: string;
  label: string;
  image?: string;
  description?: string;
  notes?: string;
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

function CreateQuotation() {
  const user = useAuthStore((state) => state.user);
  const { isInitialized } = useAuthContext();
  const navigate = useNavigate();

  // State for multi-step form
  const [step, setStep] = useState(1);
  // Step 1 fields
  const [title, setTitle] = useState("");
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [subject, setSubject] = useState("");
  const [formalMessage, setFormalMessage] = useState(`<p><strong>1. Dear Sir,</strong></p>

<p>With reference to your requirement for Air Cooling, we are pleased to submit our proposal for supply & installation of Symphony Industrial / Commercial Air Coolers.</p>

<p>The quotation is for supply of Symphony Natural Air-Cooling solution which delivers continuous fresh, filtered & cool air. Based on your cooling requirement we have calculated the cooling solution as follows:</p>`);
  // Step 2 fields
  const [selectedProducts, setSelectedProducts] = useState<ProductOption[]>([]);
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [machineInstall, setMachineInstall] = useState({
    qty: "",
    unit: "",
    price: "",
    total: "",
  });
  // Step 3 fields
  const [notes, setNotes] = useState(`<p>Recommended water supply should be less than 400 TDS. All electrical work under customer scope.</p>

<p>Size of wire suitable to ampere rating of the motor which shall be selected by qualified Electrician of the customer.</p>

<p>Use single phase preventer for all three phase machines, Spike buster for all machines & Voltage stabilizer where voltage fluctuates more than 5%.</p>

<p>Any change in quantity shall be charged extra.</p>

<p>Any kind of charges / scope of work which is not specified in above, will be extra as per actual.</p>`);
  const [billing, setBilling] = useState(`<p><strong>Material will be billed through</strong></p>

<p><strong>M/s FIVE STAR TECHNOLOGIES</strong><br>
C-165 , SECTOR-10 , NOIDA - 201301<br>
GST : 09AACFF0291J1ZF</p>`);
  const [supply, setSupply] = useState("");
  const [ic, setIC] = useState("");
  // Step 4 fields
  const [tnc, setTnc] = useState("");
  // Step 5 fields
  const [signature, setSignature] = useState<File | null>(null);
  const [signatureUrl, setSignatureUrl] = useState("");

  // Enhancement: Display options for product info
  const [displayOptions, setDisplayOptions] = useState<{
    [productId: string]: "name" | "image";
  }>({});
  const [descNoteOptions, setDescNoteOptions] = useState<{
    [productId: string]: "description" | "notes";
  }>({});
  const [customNotes, setCustomNotes] = useState<{
    [productId: string]: string;
  }>({});

  const { data: clientsData, isLoading: clientsLoading } = useClients({
    limit: 1000,
  }); // adjust limit as needed
  const customerOptions: CustomerOption[] = (clientsData?.clients || []).map(
    (client) => ({
      value: client._id,
      label: client.name,
    })
  );

  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 1000,
  });
  const productOptions: ProductOption[] = (productsData?.products || []).map(
    (product) => ({
      value: product._id,
      label: product.title,
      image: product.productImage
        ? `https://cms-be.yogendersingh.tech/public/products/${product.productImage}`
        : undefined,
      description: product.notes || "",
      notes: product.notes || "",
    })
  );

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
      // Console log all form data
      console.log("=== QUOTATION FORM DATA ===");
      console.log("Step 1 - Basic Information:");
      console.log("Title:", title);
      console.log("Customer:", customer);
      console.log("Subject:", subject);
      console.log("Formal Message:", formalMessage);
      
      console.log("\nStep 2 - Products & Installation:");
      console.log("Selected Products:", selectedProducts);
      console.log("Product Rows:", productRows);
      console.log("Machine Installation:", machineInstall);
      console.log("Display Options:", displayOptions);
      console.log("Description/Notes Options:", descNoteOptions);
      console.log("Custom Notes:", customNotes);
      
      console.log("\nStep 3 - Additional Details:");
      console.log("Notes:", notes);
      console.log("Billing Details:", billing);
      console.log("Supply:", supply);
      console.log("I&C:", ic);
      
      console.log("\nStep 4 - Terms & Conditions:");
      console.log("T&C:", tnc);
      
      console.log("\nStep 5 - Signature:");
      console.log("Signature File:", signature);
      console.log("Signature URL:", signatureUrl);
      
      console.log("\nCalculated Total Price:", calculatePrice());
      console.log("=== END QUOTATION FORM DATA ===");

      // Get authentication token
      const token = tokenStorage.getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Prepare products data
      const products = productRows.map(row => ({
        product: row.product.value,
        quantity: parseInt(row.qty) || 0,
        unit: row.unit
      }));

      // Prepare machine installation data
      const machineInstallation = {
        quantity: parseInt(machineInstall.qty) || 0,
        unit: machineInstall.unit,
        price: parseFloat(machineInstall.price) || 0,
        total: parseFloat(machineInstall.total) || 0
      };

      // Generate quotation reference number (you might want to implement a proper generator)
      const quotationRefNumber = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Prepare the request payload
      const quotationData = {
        quotationRefNumber,
        title: title || "Quotation for Industrial Equipment",
        client: customer?.value || "",
        subject: subject || "Created by " + (user?.name || "User") + " Supply of Industrial Equipment",
        formalMessage: formalMessage || "Dear Sir/Madam,\n\nWe are pleased to submit our quotation for the requested equipment...",
        products,
        machineInstallation,
        notes: notes || "Additional notes here",
        billingDetails: billing || "Payment terms: 50% advance, 50% before delivery",
        supply: supply || "Delivery within 30 days",
        installationAndCommissioning: ic || "Installation and commissioning included",
        termsAndConditions: tnc || "Standard terms and conditions apply",
        signatureImage: signature ? signature.name : "",
        totalAmount: calculatePrice(),
        relatedProducts: selectedProducts.map(p => p.value),
        suggestedProducts: selectedProducts.map(p => p.value)
      };

      console.log("Sending quotation data to API:", quotationData);

      // Make API call
      const response = await apiClient.post('/api/quotations', quotationData);
      const result = response.data;
      console.log("Quotation created successfully:", result);
      // On success, redirect to quotations list
      navigate("/quotations");
      
    } catch (error) {
      console.error("Error creating quotation:", error);
      // You might want to show an error message to the user here
      alert("Failed to create quotation. Please try again.");
    }
  };

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Products
            </label>
            <Select<ProductOption, true>
              isMulti
              options={productOptions}
              value={selectedProducts}
              onChange={handleProductSelect}
              placeholder={
                productsLoading ? "Loading products..." : "Select products"
              }
              isLoading={productsLoading}
            />
          </div>
          {productRows.length > 0 && (
            <table className="w-full mt-4 border rounded">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1">Display</th>
                  <th className="px-2 py-1">Description / Notes</th>
                  <th className="px-2 py-1">Qty</th>
                  <th className="px-2 py-1">Unit</th>
                </tr>
              </thead>
              <tbody>
                {productRows.map((row, idx) => (
                  <tr key={row.product.value} className="border-b border-grey">
                    <td className="px-2 py-1 pb-8 pt-8">
                      <Select
                        value={{
                          value: displayOptions[row.product.value] || "name",
                          label:
                            (displayOptions[row.product.value] || "name") ===
                            "name"
                              ? "Name"
                              : "Image",
                        }}
                        onChange={(opt) =>
                          setDisplayOptions((opts) => ({
                            ...opts,
                            [row.product.value]: opt?.value || "name",
                          }))
                        }
                        options={[
                          { value: "name", label: "Name" },
                          { value: "image", label: "Image" },
                        ]}
                        isSearchable={false}
                        styles={{
                          container: (base) => ({ ...base, width: '100%', height : '38px' }),
                        }}
                      />
                      {(displayOptions[row.product.value] || "name") ===
                      "name" ? (
                        <div className="h-[38px] mt-[6px] flex items-center"><span className="ml-2 block">{row.product.label}</span></div>
                      ) : (
                        <img
                          src={
                            row.product.image ||
                            "https://via.placeholder.com/50x50?text=No+Image"
                          }
                          alt={row.product.label}
                          style={{
                            width: 50,
                            height: 50,
                            objectFit: "contain",
                            display: "inline-block",
                            marginLeft: 8,
                          }}
                        />
                      )}
                    </td>
                    <td className="px-2 py-1 pb-8 pt-8">
                      <Select
                        value={{
                          value:
                            descNoteOptions[row.product.value] || "description",
                          label:
                            (descNoteOptions[row.product.value] ||
                              "description") === "description"
                              ? "Description"
                              : "Notes",
                        }}
                        onChange={(opt) =>
                          setDescNoteOptions((opts) => ({
                            ...opts,
                            [row.product.value]: opt?.value || "description",
                          }))
                        }
                        options={[
                          { value: "description", label: "Description" },
                          { value: "notes", label: "Notes" },
                        ]}
                        isSearchable={false}
                        styles={{
                          container: (base) => ({ ...base, width: '100%' }),
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Description or Notes"
                        value={
                          (descNoteOptions[row.product.value] ||
                            "description") === "notes"
                            ? customNotes[row.product.value] ??
                              row.product.notes ??
                              ""
                            : row.product.description ?? ""
                        }
                        onChange={(e) =>
                          setCustomNotes((notes) => ({
                            ...notes,
                            [row.product.value]: e.target.value,
                          }))
                        }
                        className="w-full border rounded px-2 py-1 mt-2"
                        disabled={
                          (descNoteOptions[row.product.value] ||
                            "description") !== "notes"
                        }
                      />
                    </td>
                    <td className="px-2 py-1 pb-8 pt-8">
                      <div className="h-[38px]">
                        <p>Product Qty</p>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) =>
                          handleProductRowChange(idx, "qty", e.target.value)
                        }
                        className="w-[100%] border rounded px-2 py-1 mt-[6px]"
                      />
                    </td>
                    <td className="px-2 py-1 pb-8 pt-8">
                      <div className="h-[38px]">
                        <p>Product unit</p>
                      </div>
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) =>
                          handleProductRowChange(idx, "unit", e.target.value)
                        }
                        className="w-[100%] border rounded px-2 py-1 mt-[6px]"
                      />
                    </td>
                  </tr>
                ))}
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
              Signature Upload
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleSignatureChange}
            />
            {signatureUrl && (
              <img src={signatureUrl} alt="Signature" className="mt-4 h-24" />
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
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleGeneratePDF}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" /> Generate Quotation
          </button>
        )}
      </div>
    </div>
  );
}

export default CreateQuotation;
