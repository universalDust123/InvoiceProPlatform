"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, invoiceApi } from "@/lib/api";
import { TrendingUp, AlertCircle } from "lucide-react";
import { useState } from "react";

interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingAmount: number;
  paidInvoices: number;
  draftInvoices: number;
  overdueInvoices: number;
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month",
  );

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await analyticsApi.getDashboardStats();
      return response.data as DashboardStats;
      console.log("Fetched dashboard stats:", response.data);
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const response = await invoiceApi.list();
      return response.data.content || [];
    },
  });

  const generateChartData = () => {
    const data = [];
    const invoiceCount = Number(stats?.totalInvoices || 0);
    const revenue = Number(stats?.totalRevenue || 0);
    console.log(`Generating chart data for time range: ${timeRange}, invoiceCount: ${invoiceCount}, revenue: ${revenue}`);

    if (timeRange === "week") {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      for (let i = 0; i < days.length; i++) {
        data.push({
          period: days[i],
          invoices: Math.floor(
            (invoiceCount / 7) * (0.7 + Math.random() * 0.6),
          ),
          revenue: Math.floor((revenue / 7) * (0.7 + Math.random() * 0.6)),
        });
      }
    } else if (timeRange === "month") {
      const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
      for (let i = 0; i < weeks.length; i++) {
        data.push({
          period: weeks[i],
          invoices: Math.floor(
            (invoiceCount / 4) * (0.7 + Math.random() * 0.6),
          ),
          revenue: Math.floor((revenue / 4) * (0.7 + Math.random() * 0.6)),
        });
      }
    } else {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      for (let i = 0; i < months.length; i++) {
        data.push({
          period: months[i],
          invoices: Math.floor(
            (invoiceCount / 12) * (0.7 + Math.random() * 0.6),
          ),
          revenue: Math.floor((revenue / 12) * (0.7 + Math.random() * 0.6)),
        });

        console.log(`Generated data`, data);
      }
    }
    return data;
  };

  const chartData = generateChartData();

  const invoiceStatusData = [
    {
      name: "Paid",
      value: Number(stats?.paidInvoices || 0),
    },
    {
      name: "Pending",
      value: Math.max(
        0,
        Number(stats?.totalInvoices || 0) -
          Number(stats?.paidInvoices || 0) -
          Number(stats?.draftInvoices || 0) -
          Number(stats?.overdueInvoices || 0),
      ),
    },
    {
      name: "Overdue",
      value: Number(stats?.overdueInvoices || 0),
    },
    {
      name: "Draft",
      value: Number(stats?.draftInvoices || 0),
    },
  ];

  const collectionRate =
    stats?.totalRevenue && stats?.totalRevenue > 0
      ? Math.round(
          (Number(stats.totalRevenue) /
            (Number(stats.totalRevenue) + Number(stats.pendingAmount))) *
            100,
        )
      : 0;

  const avgInvoice =
    stats?.totalInvoices && stats?.totalInvoices > 0
      ? Math.round(Number(stats.totalRevenue) / stats.totalInvoices)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Analytics</h1>
          <p className="text-zinc-400 mt-2">Track your business performance</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all">
          <p className="text-zinc-400 text-sm mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-white">
            ₹{isLoading ? "..." : (stats?.totalRevenue || 0).toLocaleString()}
          </p>
          <p className="text-xs text-emerald-400 mt-2">
            {stats?.paidInvoices || 0} invoices collected
          </p>
        </div>

        <div className="group bg-gradient-to-br from-emerald-600/20 to-emerald-400/10 border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all">
          <p className="text-zinc-400 text-sm mb-2">Pending Amount</p>
          <p className="text-3xl font-bold text-white">
            ₹{isLoading ? "..." : (stats?.pendingAmount || 0).toLocaleString()}
          </p>
          <p className="text-xs text-blue-400 mt-2">Awaiting payment</p>
        </div>

        <div className="group bg-gradient-to-br from-amber-600/20 to-amber-400/10 border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all">
          <p className="text-zinc-400 text-sm mb-2">Average Invoice</p>
          <p className="text-3xl font-bold text-white">
            ₹{isLoading ? "..." : avgInvoice.toLocaleString()}
          </p>
          <p className="text-xs text-amber-400 mt-2">Per invoice value</p>
        </div>

        <div className="group bg-gradient-to-br from-red-600/20 to-red-400/10 border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-zinc-400 text-sm mb-2">Overdue Invoices</p>
              <p className="text-3xl font-bold text-white">
                {stats?.overdueInvoices || 0}
              </p>
            </div>
            {(stats?.overdueInvoices || 0) > 0 && (
              <AlertCircle className="text-red-400" size={24} />
            )}
          </div>
          <p className="text-xs text-red-400 mt-2">Requires attention</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Revenue Trend */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-400" />
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis stroke="#666" dataKey="period" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #444",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Invoice Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            Invoice Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={invoiceStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {invoiceStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Invoices Created */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">
          Invoices Created
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis stroke="#666" dataKey="period" />
            <YAxis stroke="#666"/>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #444",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Legend />
            <Bar dataKey="invoices" fill="#10b981" name="Invoices" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6">
          <h4 className="text-white/70 text-sm font-medium mb-4">
            Collection Rate
          </h4>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-emerald-400">
              {collectionRate}%
            </p>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6">
          <h4 className="text-white/70 text-sm font-medium mb-4">
            Total Customers
          </h4>
          <p className="text-3xl font-bold text-blue-400">
            {stats?.totalCustomers || 0}
          </p>
          <p className="text-xs text-white/50 mt-2">Active customers</p>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-6">
          <h4 className="text-white/70 text-sm font-medium mb-4">
            Total Invoices
          </h4>
          <p className="text-3xl font-bold text-purple-400">
            {stats?.totalInvoices || 0}
          </p>
          <p className="text-xs text-white/50 mt-2">Lifetime invoices</p>
        </div>
      </div>
    </div>
  );
}
