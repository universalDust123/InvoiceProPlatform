"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/lib/api";
import toast from "react-hot-toast";

interface EmailCustomerFormProps {
  customer: any;
  onClose: () => void;
}

export function EmailCustomerForm({ customer, onClose }: EmailCustomerFormProps) {
    const [emailContent, setEmailContent] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data) => customerApi.email(customer.id, data),
        onSuccess: () => {
            toast.success("Email sent successfully");           
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to send email");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailContent) {
            toast.error("Email content cannot be empty");
            return;
        }
        mutation.mutate({ content: emailContent });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Email Content *
                </label>
                <textarea
                    name="emailContent"
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={5}
                    placeholder="Write your email message here..."
                />
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    Send Email
                </button>
            </div>
        </form>
    );
}   