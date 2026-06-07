"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/lib/api";
import { Plus, Mail, Trash2, Edit2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { AddCustomerForm } from "@/components/ui/add-customer-form";
import { UpdateCustomerForm } from "@/components/ui/update-customer-form";
import { EmailCustomerForm } from "@/components/ui/email-customer-form";
import { List } from "postcss/lib/list";

export default function CustomersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailCustomer, setEmailCustomer] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const response = await customerApi.list();
      return Array.isArray(response.data)
        ? response.data
        : response.data.content || [];
    },
  });

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleEmailClick = (customer: any) => {
    setEmailCustomer(customer);
    setIsEmailModalOpen(true);
  };

  const handleDeleteClick = (customerId: string) => {
    setDeletingCustomerId(customerId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingCustomerId === null) return;
    setIsDeleting(true);
    try {
      await customerApi.delete(deletingCustomerId);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsDeleteConfirmOpen(false);
      setDeletingCustomerId(null);
    } catch (error) {
      console.error("Failed to delete customer:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  {/* This is a placeholder function. In a real app, you'd integrate with an email API or use mailto links.*/}
  const handleSendEmail = async (
    email: string,
    subject: string,
    message: string,
  ) => {
    try {
      // This would call your email API if available
      // For now, we'll use mailto
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      window.location.href = mailtoLink;
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="text-zinc-400">Manage your customer information</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center text-zinc-500">
            Loading customers...
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="col-span-full text-center text-zinc-500">
            No customers yet. Add one to get started.
          </div>
        ) : (
          customers.map((customer: any) => (
            <div
              key={customer.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {customer.name}
                </h3>
                <p className="text-sm text-zinc-400">{customer.email}</p>
              </div>
              <div className="space-y-2 mb-4 text-sm text-zinc-300">
                <p>Phone: {customer.phone || "N/A"}</p>
                <p>Tax ID: {customer.taxId || "N/A"}</p>
                <p className="text-xs text-zinc-500">
                  Address: {customer.billingAddress || "N/A"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(customer)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors text-sm"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button 
                  // onClick={() => handleSendEmail(customer.email, "Hello from our team!", "We wanted to reach out to you...")
                  // }
                  onClick={() => handleEmailClick(customer)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors text-sm"
                >
                  <Mail size={14} />
                  Email
                </button>
                <button 
                  onClick={() => handleDeleteClick(customer.id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
      >
        <AddCustomerForm onClose={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Customer"
      >
        <UpdateCustomerForm
          customer={editingCustomer}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Email Customer Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Send Email"
      >
        <EmailCustomerForm
          customer={emailCustomer}
          onClose={() => setIsEmailModalOpen(false)}
        />
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Confirm Delete"
      >
        <p className="text-zinc-300">
          Are you sure you want to delete this customer? This action cannot be undone.
        </p>
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => setIsDeleteConfirmOpen(false)}
            className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>

    </div>
  );
}
