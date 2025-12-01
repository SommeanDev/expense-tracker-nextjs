"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/transactions", label: "Transactions" },
    { href: "/accounts", label: "Accounts" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="bg-blue-500 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-white text-lg"
            onClick={closeMenu}
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold">ET</span>
            </div>
            <span className="hidden sm:inline">Expense Tracker</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition px-2 py-1 rounded-md ${
                  pathname === item.href
                    ? "text-white bg-gray-800"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
              <Link
                href="/sign-in"
                className="px-3 py-1.5 text-sm text-gray-300 border border-gray-700 rounded-md hover:bg-gray-800 transition"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Sign Up
              </Link>
            </SignedOut>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-white rounded hover:bg-gray-800"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div
          className={`md:hidden overflow-hidden transition-all ${
            open ? "max-h-64 py-3" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col gap-1 border-t border-gray-700 pt-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm rounded-md ${
                  pathname === item.href
                    ? "bg-gray-800 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}

            <SignedIn>
              <Link
                href="/add-data"
                className="mt-3 px-4 py-2 rounded-md bg-indigo-600 text-white text-center text-sm font-medium hover:bg-indigo-700 transition"
                onClick={closeMenu}
              >
                + Add
              </Link>
            </SignedIn>
          </nav>
        </div>
      </div>
    </header>
  );
}
