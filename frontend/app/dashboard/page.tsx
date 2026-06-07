"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi, invoiceApi, customerApi } from "@/lib/api";
import { useAuthContext } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  FileText,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
} from "lucide-react";

interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingAmount: number;
  paidInvoices: number;
  draftInvoices: number;
  overdueInvoices: number;
}

export default function Dashboard() {
  const { user } = useAuthContext();
  console.log("User from context:", user);
  const router = useRouter();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await analyticsApi.getDashboardStats();
      return response.data as DashboardStats;
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await invoiceApi.list();
      return response.data.content || [];
    },
  });

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    trend,
    gradient,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    change?: string;
    trend?: "up" | "down";
    gradient: string;
  }) => (
    <div
      className={`group relative bg-gradient-to-br ${gradient} border border-white/10 rounded-2xl p-8 overflow-hidden transition-all duration-300 hover:border-white/30 hover:shadow-2xl hover:shadow-blue-500/20`}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wide">
            {label}
          </h3>
          <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
            {Icon}
          </div>
        </div>

        <p className="text-4xl font-bold text-white mb-4">{value}</p>

        {change && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                trend === "up"
                  ? "text-emerald-400"
                  : trend === "down"
                    ? "text-red-400"
                    : "text-blue-400"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight size={16} />
              ) : trend === "down" ? (
                <ArrowDownRight size={16} />
              ) : null}
              {change}
            </div>
          </div>
        )}
      </div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section with Gradient */}
      <div className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            👋 Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              {user?.fullName}
            </span>
            !
          </h1>
          <p className="text-white/60 text-lg">
            Here's your business snapshot for today
          </p>
        </div>
      </div>

      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<IndianRupee size={24} className="text-blue-400" />}
          label="Total Revenue"
          value={
            isLoading
              ? "..."
              : `₹${(stats?.totalRevenue || 0).toLocaleString()}`
          }
          change={`${stats?.paidInvoices || 0} paid invoices`}
          trend="up"
          gradient="from-blue-600/20 to-blue-400/10"
        />
        <StatCard
          icon={<FileText size={24} className="text-emerald-400" />}
          label="Total Invoices"
          value={isLoading ? "..." : stats?.totalInvoices.toString() || "0"}
          change={`${stats?.draftInvoices || 0} drafts`}
          trend="up"
          gradient="from-emerald-600/20 to-emerald-400/10"
        />
        <StatCard
          icon={<Users size={24} className="text-purple-400" />}
          label="Active Customers"
          value={isLoading ? "..." : stats?.totalCustomers.toString() || "0"}
          change={`${stats?.overdueInvoices || 0} overdue`}
          trend={stats?.overdueInvoices ? "down" : "up"}
          gradient="from-purple-600/20 to-purple-400/10"
        />
        <StatCard
          icon={<TrendingUp size={24} className="text-amber-400" />}
          label="Pending Amount"
          value={
            isLoading
              ? "..."
              : `₹${(stats?.pendingAmount || 0).toLocaleString()}`
          }
          change={`₹${((stats?.totalRevenue || 0) + (stats?.pendingAmount || 0)).toLocaleString()} total`}
          trend="up"
          gradient="from-amber-600/20 to-amber-400/10"
        />
      </div>

      {/* Quick Actions - Modern Design */}
      <div className="group relative bg-gradient-to-br from-blue-600/20 to-emerald-600/20 border border-white/10 rounded-2xl p-8 overflow-hidden hover:border-white/30 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <h2 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-2">
          ⚡ Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <button
            onClick={() => router.push("/invoices")}
            className="group/btn relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-semibold py-4 px-6 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500" />
            <Plus size={20} />
            <span className="relative z-10">Create Invoice</span>
          </button>

          <button
            onClick={() => router.push("/customers")}
            className="group/btn relative bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white rounded-xl font-semibold py-4 px-6 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <Plus size={20} />
            <span>Add Customer</span>
          </button>

          <button
            onClick={() => router.push("/analytics")}
            className="group/btn relative bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white rounded-xl font-semibold py-4 px-6 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm"
          >
            <FileText size={20} />
            <span>View Reports</span>
          </button>
        </div>
      </div>

      {/* Activity & Stats Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="group relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

          <h2 className="text-lg font-bold text-white mb-6 relative z-10 flex items-center gap-2">
            📊 Recent Activity
          </h2>

          <div className="space-y-3 relative z-10">
            {invoices && invoices.length > 0 ? (
              invoices.slice(0, 3).map((invoice: any, i: number) => {
                const statusEmoji =
                  invoice.status === "PAID"
                    ? "✓"
                    : invoice.status === "SENT"
                      ? "📤"
                      : invoice.status === "DRAFT"
                        ? "📝"
                        : "⏰";
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all duration-300 group/item"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{statusEmoji}</span>
                      <p className="text-white/80 font-medium group-hover/item:text-white transition-colors">
                        Invoice #{invoice.invoiceNumber || invoice.id} -{" "}
                        {invoice.status}
                      </p>
                    </div>
                    <span className="text-xs text-white/40 whitespace-nowrap ml-4">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center p-8 text-white/50">
                No recent invoices
              </div>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="group relative bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

          <h2 className="text-lg font-bold text-white mb-6 relative z-10 flex items-center gap-2">
            🎯 Performance
          </h2>

          <div className="space-y-4 relative z-10">
            {(() => {
              const collectionRate =
                stats?.totalRevenue && stats?.totalRevenue > 0
                  ? Math.round(
                      (Number(stats.totalRevenue) /
                        (Number(stats.totalRevenue) +
                          Number(stats.pendingAmount))) *
                        100,
                    )
                  : 0;
              const avgInvoice =
                stats?.totalInvoices && stats?.totalInvoices > 0
                  ? Math.round(Number(stats.totalRevenue) / stats.totalInvoices)
                  : 0;
              const outstandingRate =
                stats?.overdueInvoices && stats?.totalInvoices
                  ? Math.round(
                      (Number(stats.overdueInvoices) /
                        Number(stats.totalInvoices)) *
                        100,
                    )
                  : 0;

              return [
                {
                  label: "Collection Rate",
                  value: `${collectionRate}%`,
                  color: "emerald",
                  width: collectionRate,
                },
                {
                  label: "Average Invoice",
                  value: `₹${avgInvoice.toLocaleString()}`,
                  color: "blue",
                  width: Math.min((avgInvoice / 5000) * 100, 100),
                },
                {
                  label: "Overdue Rate",
                  value: `${outstandingRate}%`,
                  color: "amber",
                  width: outstandingRate,
                },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm font-medium">
                      {stat.label}
                    </span>
                    <span
                      className={`text-lg font-bold text-${stat.color}-400`}
                    >
                      {stat.value}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-400 rounded-full transition-all duration-500`}
                      style={{
                        width: `${stat.width}%`,
                      }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
