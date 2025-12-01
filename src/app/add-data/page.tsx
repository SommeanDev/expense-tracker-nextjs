"use client";

import { useState } from "react";
import AddTransactionForm from "@/components/AddTransactionForm";
import ImportTransactions from "@/components/ImportTransactions";

export default function Home() {
  const [mode, setMode] = useState<"manual" | "import">("manual");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <button
          onClick={() => setMode("manual")}
          className={`px-4 py-2 rounded-lg border ${
            mode === "manual"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Manual Entry
        </button>

        <button
          onClick={() => setMode("import")}
          className={`px-4 py-2 rounded-lg border ${
            mode === "import"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Import CSV / Excel
        </button>
      </div>

      {mode === "manual" && <AddTransactionForm />}
      {mode === "import" && <ImportTransactions />}
    </div>
  );
}
