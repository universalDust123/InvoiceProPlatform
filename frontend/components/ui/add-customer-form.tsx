"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/lib/api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface AddCustomerFormProps {
  onClose: () => void;
}

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  taxId: string;
}

interface ErrorResponse {
  message: string;
}

export function AddCustomerForm({ onClose }: AddCustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    billingAddress: "",
    taxId: "",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CustomerFormData) => customerApi.create(data),
    onSuccess: () => {
      toast.success("Customer added successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      onClose();
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to add customer");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Phone
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 123-4567"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Billing Address */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Billing Address
        </label>
        <input
          type="text"
          name="billingAddress"
          value={formData.billingAddress}
          onChange={handleChange}
          placeholder="123 Business St, City, State, ZIP"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tax ID */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Tax ID
        </label>
        <input
          type="text"
          name="taxId"
          value={formData.taxId}
          onChange={handleChange}
          placeholder="GSTIN or Tax ID"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
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
          {mutation.isPending ? "Adding..." : "Add Customer"}
        </button>
      </div>
    </form>
  );
}
