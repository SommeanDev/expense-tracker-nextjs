"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Transaction } from "@/types/transaction";
import { Account } from "@/types/account";

interface Props {
  onUploadSuccess?: () => void;
}

export default function ImportTransactions({ onUploadSuccess }: Props) {
  const [importedData, setImportedData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<any>({
    date: "",
    description: "",
    category: "",
    amount: "",
    type: "",
  });

  const [mappedData, setMappedData] = useState<Partial<Transaction>[] | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | "">("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/accounts");
        const json = await res.json();
        if (res.ok && json.data) {
          setAccounts(json.data);
          if (json.data.length > 0) setSelectedAccountId(json.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  const parseFile = (file: File) => {
    const fileExtension = file.name.split(".").pop();

    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          setImportedData(results.data);
          setColumns(Object.keys(results.data[0] || {}));
        },
      });
    } else if (fileExtension === "xlsx") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setImportedData(json);
        setColumns(Object.keys(json[0] || {}));
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleMapping = () => {
    const transformed = importedData.map((row: any) => {
      const typeRaw = row[mapping.type];

      let type: "income" | "expense" = "expense"; // default

      if (typeRaw) {
        const typeCell = String(typeRaw).trim().toLowerCase();

        if (
          typeCell === "cr" ||
          typeCell === "credit" ||
          typeCell.includes("inc") ||
          typeCell.includes("income")
        ) {
          type = "income";
        } else if (
          typeCell === "dr" ||
          typeCell === "debit" ||
          typeCell.includes("exp") ||
          typeCell.includes("expense")
        ) {
          type = "expense";
        } else if (!isNaN(parseFloat(String(row[mapping.amount])))) {
          type =
            parseFloat(String(row[mapping.amount])) >= 0 ? "income" : "expense";
        }
      } else if (!isNaN(parseFloat(String(row[mapping.amount])))) {
        type =
          parseFloat(String(row[mapping.amount])) >= 0 ? "income" : "expense";
      }

      const dateIso =
        row[mapping.date] !== undefined && row[mapping.date] !== null
          ? new Date(String(row[mapping.date])).toISOString()
          : new Date().toISOString();

      const amountNum =
        row[mapping.amount] === undefined || row[mapping.amount] === null
          ? 0
          : Number(String(row[mapping.amount]).replace(/[^0-9.-]+/g, ""));

      return {
        date: dateIso,
        description: row[mapping.description] || "",
        category: row[mapping.category] || "General",
        amount: Math.abs(amountNum),
        type,
        accountId: selectedAccountId || undefined,
      } as Partial<Transaction>;
    });

    setMappedData(transformed);
  };

  const handleDBUpload = async () => {
    if (!mappedData || mappedData.length === 0) return;

    setUploading(true);
    try {
      const response = await fetch("/api/transactions/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mappedData),
      });

      const result = await response.json();

      if (result.error) {
        console.error("Error uploading transactions:", result.error);
        alert("Failed to upload transactions!");
      } else {
        console.log("Transactions uploaded successfully:", result.data);
        alert(`Uploaded ${mappedData.length} transactions successfully!`);
        setMappedData(null);
        setImportedData([]);
        setColumns([]);
        setMapping({
          date: "",
          description: "",
          category: "",
          amount: "",
          type: "",
        });
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (error) {
      console.error("Error uploading transactions:", error);
      alert("Failed to upload transactions!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-600 p-6 rounded-xl shadow max-w-wd mx-auto">
      <h2 className="text-lg font-bold mb-4 text-white">Import Transactions</h2>

      <div className="mb-3">
        <label className="text-sm block mb-1">Assign to account</label>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="">Default account (will be created if needed)</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
      </div>

      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        onChange={(e) => e.target.files && parseFile(e.target.files[0])}
        className="w-full p-2 border rounded mb-4"
      />

      {importedData.length > 0 && (
        <>
          <h3 className="font-semibold mb-2">Map Columns</h3>

          {Object.keys(mapping).map((field) => (
            <div className="mb-2" key={field}>
              <label className="block text-sm">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <select
                className="border p-2 w-full rounded bg-gray-600"
                value={mapping[field]}
                onChange={(e) =>
                  setMapping({ ...mapping, [field]: e.target.value })
                }
              >
                <option value="">Select a column</option>
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {mappedData && (
            <button
              onClick={handleDBUpload}
              disabled={uploading}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded"
            >
              {uploading ? "Uploading..." : "Upload to Database"}
            </button>
          )}

          <button
            onClick={handleMapping}
            className="mt-3 w-full bg-green-600 text-white py-2 rounded"
          >
            Apply Mapping
          </button>
        </>
      )}

      {mappedData && (
        <pre className="bg-gray-800 p-3 mt-4 rounded max-h-64 overflow-auto text-sm">
          {JSON.stringify(mappedData, null, 2)}
        </pre>
      )}
    </div>
  );
}
