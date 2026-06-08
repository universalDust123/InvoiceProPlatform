"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { invoiceApi, customerApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Trash2, Plus } from "lucide-react";
import { AxiosError } from "axios";

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface InvoiceItem {
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxPercentage: string;
}

interface ErrorResponse {
  message: string;
}

interface InvoiceData {
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  items: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxPercentage: number;
  }[];
}

interface AddInvoiceFormProps {
  onClose: () => void;
}

// Pure function to calculate default dates
function getDefaultDates() {
  const today = new Date();
  const issueDate = today.toISOString().split("T")[0];

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const dueDateStr = dueDate.toISOString().split("T")[0];

  return { issueDate, dueDateStr };
}

export function AddInvoiceForm({ onClose }: AddInvoiceFormProps) {
  const { issueDate: defaultIssueDate, dueDateStr: defaultDueDate } =
    getDefaultDates();

  const [formData, setFormData] = useState({
    customerId: "",
    issueDate: defaultIssueDate,
    dueDate: defaultDueDate,
    notes: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      name: "",
      description: "",
      quantity: "1",
      unitPrice: "",
      taxPercentage: "0",
    },
  ]);

  const queryClient = useQueryClient();

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await customerApi.list();
      console.log("No.Of Customers: " + response.data.length);
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InvoiceData) => invoiceApi.create(data),
    onSuccess: () => {
      toast.success("Invoice created successfully");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      onClose();
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to create invoice");
    },
  });

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        description: "",
        quantity: "1",
        unitPrice: "",
        taxPercentage: "0",
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      toast.error("Invoice must have at least one item");
    }
  };

  const calculateLineTotal = (
    quantity: string,
    unitPrice: string,
    taxPercentage: string,
  ): string => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(unitPrice) || 0;
    const t = parseFloat(taxPercentage) || 0;
    const subtotal = q * p;
    const tax = subtotal * (t / 100);
    return (subtotal + tax).toFixed(2);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unitPrice) || 0;
      const t = parseFloat(item.taxPercentage) || 0;
      const itemSubtotal = q * p;
      const itemTax = itemSubtotal * (t / 100);

      subtotal += itemSubtotal;
      taxTotal += itemTax;
    });

    return {
      subtotal: subtotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      grandTotal: (subtotal + taxTotal).toFixed(2),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customerId) {
      toast.error("Customer is required");
      return;
    }

    const hasValidItems = items.every(
      (item) => item.name && item.quantity && item.unitPrice,
    );

    if (!hasValidItems) {
      toast.error("All items must have name, quantity, and unit price");
      return;
    }

    const invoiceData = {
      customerId: formData.customerId,
      customerName:
        customers.find((c) => c.id === formData.customerId)?.name || "",
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      notes: formData.notes,
      subtotal: parseFloat(totals.subtotal),
      taxTotal: parseFloat(totals.taxTotal),
      grandTotal: parseFloat(totals.grandTotal),
      items: items.map((item) => ({
        name: item.name,
        description: item.description,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        taxPercentage: parseFloat(item.taxPercentage),
      })),
    };

    mutation.mutate(invoiceData);
  };

  const totals = calculateTotals();

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[80vh] overflow-y-auto"
    >
      {/* Customer Selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Customer *
        </label>
        <select
          name="customerId"
          value={formData.customerId}
          onChange={handleFormChange}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a customer...</option>
          {customers.map((customer: Customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} ({customer.email})
            </option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Issue Date *
          </label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleFormChange}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Due Date *
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleFormChange}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Line Items */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Line Items *
        </label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="space-y-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Item name *"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  placeholder="Qty *"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Unit Price *"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) =>
                    handleItemChange(index, "unitPrice", e.target.value)
                  }
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Tax %"
                  step="0.01"
                  value={item.taxPercentage}
                  onChange={(e) =>
                    handleItemChange(index, "taxPercentage", e.target.value)
                  }
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  disabled
                  value={`₹${calculateLineTotal(item.quantity, item.unitPrice, item.taxPercentage)}`}
                  className="px-2 py-1 bg-zinc-700/50 border border-zinc-700 rounded text-zinc-400 text-sm"
                />
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex items-center gap-1 px-3 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {/* Totals */}
      <div className="border-t border-zinc-700 pt-4 space-y-2">
        <div className="flex justify-between text-sm text-zinc-300">
          <span>Subtotal:</span>
          <span>₹{totals.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-300">
          <span>Tax Total:</span>
          <span>₹{totals.taxTotal}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold text-white bg-zinc-800/50 px-3 py-2 rounded">
          <span>Grand Total:</span>
          <span>₹{totals.grandTotal}</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleFormChange}
          placeholder="Payment terms, special instructions..."
          rows={3}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4 border-t border-zinc-700">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Creating..." : "Create Invoice"}
        </button>
      </div>
    </form>
  );
}
