"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Transaction } from "@/types/transaction";
import { Account } from "@/types/account";

interface Props {
  initialData: Transaction[]; // first page server-side
  accounts: Account[];
  pageLimit?: number;
}

export default function TransactionTable({
  initialData,
  accounts,
  pageLimit = 25,
}: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialData ?? [],
  );
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const searchTimer = useRef<number | null>(null);

  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<
    "all" | "income" | "expense"
  >("all");
  const [limit, setLimit] = useState<number>(pageLimit);

  // Debounce search input
  useEffect(() => {
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }
    searchTimer.current = window.setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, 300);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [search]);

  // Fetch a page from the server API
  const fetchPage = async (pageToFetch: number, limitToUse: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/transactions/list?page=${pageToFetch}&limit=${limitToUse}`,
      );
      const json = await res.json();
      if (res.ok && json.data) {
        const rows = json.data.map((r: any) => ({
          id: r.id,
          date: String(r.date),
          description: r.description,
          category: r.category,
          amount: Number(r.amount),
          type: (r.type as "income" | "expense") ?? r.type,
          accountId: (r.account_id ?? r.accountId ?? r.account_id) as
            | string
            | undefined,
        })) as Transaction[];

        setTransactions(rows);
        setHasMore(rows.length === limitToUse);
      } else {
        console.error("Failed to fetch transactions page:", json);
      }
    } catch (err) {
      console.error("Error fetching transactions page:", err);
    } finally {
      setLoading(false);
    }
  };

  // When page or limit changes, fetch (page 1 uses initialData)
  useEffect(() => {
    if (page === 1 && limit === pageLimit) {
      setTransactions(initialData ?? []);
      setHasMore((initialData?.length ?? 0) === limit);
      return;
    }
    fetchPage(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Filtered view (client-side filter over current page)
  const filtered = useMemo(() => {
    let list = transactions;

    if (selectedAccountId !== "all") {
      list = list.filter((t) => t.accountId === selectedAccountId);
    }
    if (selectedType !== "all") {
      list = list.filter((t) => t.type === selectedType);
    }
    if (debouncedSearch) {
      list = list.filter((t) => {
        const q = debouncedSearch;
        return (
          (t.description || "").toLowerCase().includes(q) ||
          (t.category || "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [transactions, selectedAccountId, selectedType, debouncedSearch]);

  const getAccountName = (accountId?: string) => {
    if (!accountId || accountId === "null") return "--";
    const acc = accounts.find((a) => a.id === accountId);
    return acc ? acc.name : "Unknown";
  };

  const resetFilters = () => {
    setSelectedAccountId("all");
    setSelectedType("all");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="card fade-in">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm subtle mr-2">Account:</label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="p-2 rounded bg-gray-800 text-sm"
            aria-label="Filter account"
          >
            <option value="all">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <label className="text-sm subtle ml-4 mr-2">Type:</label>
          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as "all" | "income" | "expense")
            }
            className="p-2 rounded bg-gray-800 text-sm"
            aria-label="Filter type"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            placeholder="Search description or category"
            className="p-2 rounded bg-gray-800 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search transactions"
          />

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="p-2 rounded bg-gray-800 text-sm"
            aria-label="Rows per page"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <button
            onClick={resetFilters}
            className="btn btn-ghost"
            aria-label="Reset filters"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="table-soft min-w-full">
          <thead>
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Account</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center subtle">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center subtle">
                  No transactions on this page
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[rgba(255,255,255,0.02)]">
                  <td className="p-3">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="p-3">{item.description}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{getAccountName(item.accountId)}</td>
                  <td className="p-3 capitalize">{item.type}</td>
                  <td className="p-3 text-right">
                    ₹{item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm subtle">Page {page}</div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="btn btn-ghost"
            aria-label="Previous page"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore || loading}
            className="btn btn-primary"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
