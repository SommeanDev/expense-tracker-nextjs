"use client";

import { useState } from "react";
import AddTransactionForm from "./AddTransactionForm";
import ImportTransactions from "./ImportTransactions";
import { useRouter } from "next/navigation";

export default function AddEntryModal() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"manual" | "import">("manual");
  const router = useRouter();

  const openModal = (which: "manual" | "import" = "manual") => {
    setTab(which);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
  };

  const handleSuccess = () => {
    // close and refresh server data (re-fetch in app directory)
    closeModal();
    try {
      router.refresh();
    } catch (err) {
      // ignore if not available
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => openModal("manual")}
          className="bg-green-600 text-white px-3 py-2 rounded"
        >
          + Add Data
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center p-6"
        >
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTab("manual")}
                  className={`px-3 py-1 rounded ${tab === "manual" ? "bg-gray-700 text-white" : "bg-gray-600 text-gray-300"}`}
                >
                  Manual
                </button>
                <button
                  onClick={() => setTab("import")}
                  className={`px-3 py-1 rounded ${tab === "import" ? "bg-gray-700 text-white" : "bg-gray-600 text-gray-300"}`}
                >
                  Import
                </button>
              </div>

              <div>
                <button
                  onClick={closeModal}
                  className="text-gray-300 hover:text-white px-3 py-1 rounded"
                  aria-label="Close"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-6">
              {tab === "manual" && (
                <AddTransactionForm onSuccess={handleSuccess} />
              )}
              {tab === "import" && (
                <ImportTransactions onUploadSuccess={handleSuccess} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
