"use client";

import { useEffect, useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import AccountsSection from "./AccountSection";
import { Transaction } from "@/types/transaction";
import { Account } from "@/types/account";

export default function ProfileSection() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts");
      const json = await res.json();
      if (res.ok && json.data) {
        setAccounts(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    }
  };

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transactions/recent");
      const json = await res.json();
      if (res.ok && json.data) {
        setRecent(
          json.data.map((r: any) => ({
            id: r.id,
            date: String(r.date),
            description: r.description,
            category: r.category,
            amount: Number(r.amount),
            type: r.type,
            accountId: r.accountId,
          })),
        );
      } else {
        console.error("Failed to fetch recent transactions", json);
      }
    } catch (err) {
      console.error("Error fetching recent transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return;
    fetchAccounts();
    fetchRecent();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) return null;
  if (!isSignedIn)
    return (
      <div className="text-sm text-gray-400">Sign in to view your profile.</div>
    );

  const fullName =
    user?.fullName ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const email =
    (user as any)?.primaryEmailAddress?.email ||
    (user as any)?.emailAddresses?.[0]?.email ||
    "";

  // Try common avatar fields if available; fall back to initial
  const avatarUrl =
    (user as any)?.imageUrl ??
    (user as any)?.profileImageUrl ??
    (user as any)?.profile_image_url ??
    null;

  const getAccountName = (id?: string) => {
    if (!id) return "--";
    const a = accounts.find((acc) => acc.id === id);
    return a ? a.name : "Unknown";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left column: small (user data) */}
      <div className="lg:col-span-1">
        <div className="bg-gray-700 p-6 rounded shadow flex flex-col items-center gap-4">
          {/* Avatar area */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName || "User avatar"}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-bold">
              {fullName ? fullName.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {fullName || "Unnamed user"}
            </div>
            <div className="text-sm text-gray-300">{email}</div>
          </div>

          <div className="w-full flex justify-center">
            <SignOutButton>
              <button className="bg-red-600 text-white px-3 py-1 rounded">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      {/* Right column: bigger (accounts + recent activity) */}
      <div className="lg:col-span-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Accounts</h2>
          <AccountsSection />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">
            Recent Activity
          </h2>
          <div className="bg-gray-700 p-4 rounded shadow">
            {loading && <div className="text-sm text-gray-300">Loading...</div>}
            {!loading && recent.length === 0 && (
              <div className="text-sm text-gray-300">
                No recent transactions
              </div>
            )}
            {!loading && recent.length > 0 && (
              <table className="w-full text-sm">
                <thead className="text-left text-gray-400">
                  <tr>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Account</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id} className="border-t border-gray-600">
                      <td className="py-2">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className="py-2">{t.description}</td>
                      <td className="py-2">{getAccountName(t.accountId)}</td>
                      <td className="py-2 capitalize">{t.type}</td>
                      <td className="py-2 text-right">₹{t.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
