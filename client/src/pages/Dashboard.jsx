import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listExpenses, createExpense, removeExpense } from "../api/expenses";

export default function Dashboard() {
  const qc = useQueryClient();

  // minimal filters/pagination
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [reimbursable, setReimb] = useState("");

  const params = useMemo(
    () => ({ page, limit: 10, q, category, reimbursable, sort: "-createdAt" }),
    [page, q, category, reimbursable]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["expenses", params],
    queryFn: () => listExpenses(params),
    keepPreviousData: true,
  });

  // quick add (minimal)
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [taxRate, setTax] = useState("");
  const [catNew, setCatNew] = useState("");
  const [reimbNew, setReimbNew] = useState("false");

  const mCreate = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      setTitle(""); setAmount(""); setTax(""); setCatNew(""); setReimbNew("false");
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const mDelete = useMutation({
    mutationFn: removeExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });

  useEffect(() => { setPage(1); }, [q, category, reimbursable]);

  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Expenses</h2>
        <span className="text-sm text-gray-600">{total} total</span>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-2">
        <input
          className="border p-2"
          placeholder="Search title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          <option>Food</option>
          <option>Travel</option>
          <option>Office</option>
          <option>Other</option>
        </select>
        <select
          className="border p-2"
          value={reimbursable}
          onChange={(e) => setReimb(e.target.value)}
        >
          <option value="">Any reimbursable</option>
          <option value="true">Reimbursable</option>
          <option value="false">Non-reimbursable</option>
        </select>
      </div>

      {/* quick add form */}
      <div className="border p-3 rounded-md">
        <div className="font-medium mb-2">Quick add</div>
        <div className="grid md:grid-cols-5 gap-2">
          <input className="border p-2" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <input className="border p-2" placeholder="Amount" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} />
          <input className="border p-2" placeholder="Tax %" type="number" value={taxRate} onChange={(e)=>setTax(e.target.value)} />
          <select className="border p-2" value={catNew} onChange={(e)=>setCatNew(e.target.value)}>
            <option value="">Category</option>
            <option>Food</option><option>Travel</option><option>Office</option><option>Other</option>
          </select>
          <select className="border p-2" value={reimbNew} onChange={(e)=>setReimbNew(e.target.value)}>
            <option value="false">Non-reimbursable</option>
            <option value="true">Reimbursable</option>
          </select>
        </div>
        <button
          onClick={() => mCreate.mutate({
            title,
            amount: Number(amount || 0),
            taxRate: Number(taxRate || 0),
            category: catNew || "Other",
            reimbursable: reimbNew === "true",
          })}
          className="mt-2 bg-black text-white px-4 py-2"
          disabled={mCreate.isPending || !title || !amount}
        >
          {mCreate.isPending ? "Adding..." : "Add"}
        </button>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Title</th>
              <th className="p-2">Category</th>
              <th className="p-2">Reimb</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Tax %</th>
              <th className="p-2">Total</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="p-3" colSpan="7">Loading…</td></tr>
            )}
            {isError && !isLoading && (
              <tr><td className="p-3 text-red-600" colSpan="7">Failed to load.</td></tr>
            )}
            {!isLoading && data?.items?.length === 0 && (
              <tr><td className="p-3" colSpan="7">No expenses found.</td></tr>
            )}
            {data?.items?.map((e) => (
              <tr key={e._id} className="border-t">
                <td className="p-2">{e.title}</td>
                <td className="p-2 text-center">{e.category}</td>
                <td className="p-2 text-center">{e.reimbursable ? "Yes" : "No"}</td>
                <td className="p-2 text-right">{e.amount}</td>
                <td className="p-2 text-right">{e.taxRate}</td>
                <td className="p-2 text-right font-semibold">{e.total}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => mDelete.mutate(e._id)}
                    className="text-red-600 underline"
                    disabled={mDelete.isPending}
                  >
                    {mDelete.isPending ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pager */}
      <div className="flex items-center gap-2">
        <button className="border px-3 py-1" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          className="border px-3 py-1"
          onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
