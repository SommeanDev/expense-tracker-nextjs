"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
} from "recharts";

interface Totals {
  income: number;
  expense: number;
  net: number;
}

interface CategoryRow {
  category: string;
  total: number;
  [key: string]: any;
}

interface WeeklyRow {
  week: string; // 'YYYY-Www'
  total: number;
  [key: string]: any;
}

interface MonthlyRow {
  month: string; // 'YYYY-MM'
  total: number;
  [key: string]: any;
}

interface YearlyRow {
  year: string; // 'YYYY'
  total: number;
  [key: string]: any;
}

interface AccountRow {
  accountId: string;
  accountName: string;
  total: number;
  [key: string]: any;
}

interface Props {
  totals: Totals;
  byCategory: CategoryRow[]; // expense-only categories
  weekly: WeeklyRow[];
  monthly: MonthlyRow[];
  yearly: YearlyRow[];
  byAccount: AccountRow[];
}

const COLORS = [
  "#ff7f7f",
  "#ffc658",
  "#8884d8",
  "#82ca9d",
  "#8dd1e1",
  "#a4de6c",
];

export default function DashboardCharts({
  totals,
  byCategory,
  weekly,
  monthly,
  yearly,
  byAccount,
}: Props) {
  const [granularity, setGranularity] = useState<"week" | "month" | "year">(
    "month",
  );

  const formatCurrency = (v: number) => `₹${v.toLocaleString()}`;

  // Build bar chart data depending on granularity
  const barData = (() => {
    if (granularity === "week") {
      return weekly.map((w) => ({ label: w.week, value: w.total }));
    } else if (granularity === "year") {
      return yearly.map((y) => ({ label: y.year, value: y.total }));
    } else {
      return monthly.map((m) => ({ label: m.month, value: m.total }));
    }
  })();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded">
          <div className="text-sm text-gray-300">Total Income</div>
          <div className="text-2xl font-bold text-green-300">
            {formatCurrency(totals.income)}
          </div>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <div className="text-sm text-gray-300">Total Expense</div>
          <div className="text-2xl font-bold text-red-300">
            {formatCurrency(totals.expense)}
          </div>
        </div>
        <div className="bg-gray-700 p-4 rounded">
          <div className="text-sm text-gray-300">Net</div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totals.net)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded relative flex flex-col items-center">
          <h3 className="text-white font-semibold mb-2">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={byCategory}
                dataKey="total"
                nameKey="category"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                label={({ name, percent }: any) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {byCategory.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <ReTooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 16, fill: "#fff", fontWeight: 700 }}
              >
                {formatCurrency(totals.expense)}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-700 p-4 rounded lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Totals</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setGranularity("week")}
                className={`px-3 py-1 rounded ${granularity === "week" ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200"}`}
              >
                Week
              </button>
              <button
                onClick={() => setGranularity("month")}
                className={`px-3 py-1 rounded ${granularity === "month" ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200"}`}
              >
                Month
              </button>
              <button
                onClick={() => setGranularity("year")}
                className={`px-3 py-1 rounded ${granularity === "year" ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200"}`}
              >
                Year
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <ReTooltip />
              <Bar dataKey="value" fill="#82ca9d" />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-700 p-4 rounded">
        <h3 className="text-white font-semibold mb-2">By Account</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={byAccount}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="accountName" />
            <YAxis />
            <ReTooltip />
            <Bar dataKey="total" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
