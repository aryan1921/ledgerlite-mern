
import api from "./client";


function toIsoOrUndef(value, endOfDay = false) {
  if (!value) return undefined;

  
  if (value instanceof Date && !isNaN(value)) {
    return value.toISOString();
  }

  
  if (typeof value === "string") {
    
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const isoLike = endOfDay
        ? `${value}T23:59:59.999`
        : `${value}T00:00:00.000`;
      const d = new Date(isoLike);
      return isNaN(d) ? undefined : d.toISOString();
    }
    
    const d = new Date(value);
    return isNaN(d) ? undefined : d.toISOString();
  }

  return undefined;
}


export function listExpenses({
  page = 1,
  limit = 10,
  q,
  category,
  reimbursable,
  sort = "-createdAt",
  from,
  to,
} = {}) {
  const params = {
    page,
    limit,
    q,
    category,
    sort,
    
    reimbursable:
      typeof reimbursable === "boolean" ? String(reimbursable) : reimbursable,
   
    from: toIsoOrUndef(from, false),
    to: toIsoOrUndef(to, true),
  };

  return api.get("/expenses", { params }).then((r) => r.data);
}

export function createExpense(payload) {
  return api.post("/expenses", payload).then((r) => r.data);
}

export function updateExpense(id, payload) {
  return api.put(`/expenses/${id}`, payload).then((r) => r.data);
}

export function removeExpense(id) {
  return api.delete(`/expenses/${id}`).then((r) => r.data);
}

/* -----------------------------------------------------------
   Optional helper you can import in the Dashboard:

   // Get the YYYY-MM-DD range for a given month
   export function monthRange(year, monthIndexZeroBased) {
     const y = Number(year), m = Number(monthIndexZeroBased);
     const pad = (n) => String(n).padStart(2, "0");
     const start = `${y}-${pad(m + 1)}-01`;
     const lastDay = new Date(y, m + 1, 0).getDate();
     const end = `${y}-${pad(m + 1)}-${pad(lastDay)}`;
     return { from: start, to: end };
   }
----------------------------------------------------------- */
