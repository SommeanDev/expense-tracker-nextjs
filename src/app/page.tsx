"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Redirect signed-in users to /transactions
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-200 to-blue-500 text-center p-6">
      <h1 className="text-4xl font-extrabold mb-4 text-white">
        Welcome to Expense Tracker
      </h1>
      <p className="text-white mb-6 max-w-xl">
        Track your income and expenses easily. Import transactions from
        CSV/Excel or add them manually.
      </p>

      {!isSignedIn && (
        <SignInButton>
          <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition">
            Sign In / Sign Up
          </button>
        </SignInButton>
      )}
    </div>
  );
}
