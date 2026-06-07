"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceApi } from "@/lib/api";
import { Plus, Download, Mail, Trash2, Edit, Check, Send } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { AddInvoiceForm } from "@/components/ui/add-invoice-form";
import { EditInvoiceForm } from "@/components/ui/edit-invoice-form";
import toast from "react-hot-toast";


export default function InvoicesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await invoiceApi.list();
      const responseData = response?.data;

      let result: any[] = [];
      if (Array.isArray(responseData)) {
        result = responseData;
      } else if (responseData?.content && Array.isArray(responseData.content)) {
        result = [...responseData.content];
      }

      return result;
    },
    initialData: [],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoiceApi.delete(id),
    onSuccess: () => {
      toast.success("Invoice deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete invoice");
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (id: string) => invoiceApi.sendEmail(id),
    onSuccess: () => {
      toast.success("Invoice sent to customer via email");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send email");
    },
  });

  // Download PDF mutation
  const downloadPdfMutation = useMutation({
    mutationFn: (id: string) => invoiceApi.downloadPdf(id),
    onSuccess: (data: any, id: string) => {
      const url = window.URL.createObjectURL(data.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to download PDF");
    },
  });

  // Send invoice mutation (change status from DRAFT to SENT)
  const sendInvoiceMutation = useMutation({
    mutationFn: (id: string) => invoiceApi.sendInvoice(id),
    onSuccess: () => {
      toast.success("Invoice sent successfully");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setProcessingId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send invoice");
      setProcessingId(null);
    },
  });

  // Mark as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: (id: string) => invoiceApi.markAsPaid(id),
    onSuccess: () => {
      toast.success("Invoice marked as paid");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setProcessingId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to mark as paid");
      setProcessingId(null);
    },
  });

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
    }
  };

  const handleEditClick = (id: string) => {
    setEditingInvoiceId(id);
    setIsEditModalOpen(true);
  };

  const handleDownloadClick = (id: string) => {
    downloadPdfMutation.mutate(id);
  };

  const handleSendEmailClick = (id: string) => {
    sendEmailMutation.mutate(id);
  };

  const handleSendInvoiceClick = (id: string) => {
    setProcessingId(id);
    sendInvoiceMutation.mutate(id);
  };

  const handleMarkAsPaidClick = (id: string) => {
    setProcessingId(id);
    markAsPaidMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Invoices</h1>
          <p className="text-zinc-400">Manage and track all your invoices</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-800/50">
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">
                Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  Loading invoices...
                </td>
              </tr>
            ) : !invoices || invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  No invoices yet. Create one to get started.
                </td>
              </tr>
            ) : (
              invoices.map((invoice: any) => (
                <tr
                  key={invoice.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/50"
                >
                  <td className="px-6 py-4 text-sm text-white">
                    #{invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    {invoice.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    ₹{invoice.grandTotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : invoice.status === "PENDING"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {invoice.createdAt.slice(0, 10)}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleDownloadClick(invoice.id)}
                      disabled={downloadPdfMutation.isPending}
                      className="p-1 hover:bg-zinc-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download PDF"
                    >
                      <Download size={16} className="text-zinc-400" />
                    </button>
                    <button
                      onClick={() => handleSendEmailClick(invoice.id)}
                      disabled={sendEmailMutation.isPending}
                      className="p-1 hover:bg-zinc-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Send via Email"
                    >
                      <Mail size={16} className="text-zinc-400" />
                    </button>
                    {invoice.status === "DRAFT" && (
                      <>
                        <button
                          onClick={() => handleSendInvoiceClick(invoice.id)}
                          disabled={
                            processingId === invoice.id &&
                            sendInvoiceMutation.isPending
                          }
                          className="p-1 hover:bg-zinc-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Send Invoice (lock status)"
                        >
                          <Send size={16} className="text-amber-400" />
                        </button>
                        <button
                          onClick={() => handleEditClick(invoice.id)}
                          className="p-1 hover:bg-zinc-800 rounded"
                          title="Edit Invoice"
                        >
                          <Edit size={16} className="text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(invoice.id)}
                          className="p-1 hover:bg-zinc-800 rounded"
                          title="Delete Invoice"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </>
                    )}
                    {invoice.status === "SENT" && (
                      <button
                        onClick={() => handleMarkAsPaidClick(invoice.id)}
                        disabled={
                          processingId === invoice.id &&
                          markAsPaidMutation.isPending
                        }
                        className="p-1 hover:bg-zinc-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mark as Paid"
                      >
                        <Check size={16} className="text-emerald-400" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        size="lg"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Invoice"
      >
        <AddInvoiceForm onClose={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal
        size="lg"
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingInvoiceId(null);
        }}
        title="Edit Invoice"
      >
        {editingInvoiceId && (
          <EditInvoiceForm
            invoiceId={editingInvoiceId}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingInvoiceId(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Invoice?
            </h3>
            <p className="text-zinc-400 mb-6">
              This action cannot be undone. Are you sure you want to delete this
              invoice?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
