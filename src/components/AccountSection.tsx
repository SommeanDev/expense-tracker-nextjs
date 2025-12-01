"use client";

import { useEffect, useState } from "react";
import { Account } from "@/types/account";

export default function AccountsSection() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchAccounts = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/accounts");
      const json = await res.json();
      if (res.ok && json.data) {
        setAccounts(json.data);
      } else {
        console.error("Failed to fetch accounts", json);
      }
    } catch (err) {
      console.error("Error fetching accounts", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setAccounts((prev) => [json.data, ...prev]);
        setName("");
      } else {
        console.error("Failed to create account:", json);
        alert("Failed to create account");
      }
    } catch (err) {
      console.error("Error creating account:", err);
      alert("Error creating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded">
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          className="flex-1 p-2 rounded border bg-gray-600 text-white"
          placeholder="Account name (e.g. Checking)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Add"}
        </button>
      </form>

      {fetching && (
        <div className="text-sm text-gray-300">Loading accounts...</div>
      )}

      {!fetching && accounts.length === 0 && (
        <div className="text-sm text-gray-300">No accounts yet.</div>
      )}

      {!fetching && accounts.length > 0 && (
        <ul className="space-y-2">
          {accounts.map((acc) => (
            <li
              key={acc.id}
              className="p-2 bg-gray-800 rounded flex justify-between items-center"
            >
              <div>
                <div className="text-white font-medium">{acc.name}</div>
                <div className="text-sm text-gray-400">
                  Created: {new Date(acc.createdAt).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
