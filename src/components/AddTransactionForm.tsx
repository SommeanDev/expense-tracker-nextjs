"use client";

import { useEffect, useState } from "react";
import { Account } from "@/types/account";

interface Props {
  onSuccess?: () => void;
}

export default function AddTransactionForm({ onSuccess }: Props) {
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [loading, setLoading] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | "">("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/accounts");
        const json = await res.json();
        if (res.ok && json.data) {
          setAccounts(json.data);
          if (json.data.length > 0) {
            setSelectedAccountId(json.data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body: any = {
      date,
      description,
      amount: parseFloat(amount),
      category,
      type,
    };

    // include accountId if user selected one
    if (selectedAccountId) {
      body.accountId = selectedAccountId;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.error) {
        console.error("Error saving transaction:", result.error);
        alert("Failed to save transaction!");
      } else {
        console.log("Transaction saved:", result.data);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to save transaction!");
    } finally {
      setLoading(false);
    }

    // Reset form fields
    setDate("");
    setDescription("");
    setAmount("");
    setCategory("");
    setType("expense");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto bg-gray-700 p-6 rounded-xl shadow"
    >
      <h2 className="text-lg font-bold">Add Transaction</h2>

      <select
        value={selectedAccountId}
        onChange={(e) => setSelectedAccountId(e.target.value)}
        className="w-full p-2 border rounded bg-gray-600 text-white"
      >
        <option value="">Default account (will be created if needed)</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value as "income" | "expense")}
        className="w-full p-2 border rounded bg-gray-700"
        required
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? "Saving..." : "Add Transaction"}
      </button>
    </form>
  );
}
