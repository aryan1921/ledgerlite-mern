import api from "./client";

// server supports: page, limit, q (title search), category, reimbursable, sort
export async function listExpenses(params) {
  const { data } = await api.get("/expenses", { params });
  return data; // { items, total, page, limit }
}

export async function createExpense(payload) {
  const { data } = await api.post("/expenses", payload);
  return data;
}

export async function updateExpense(id, payload) {
  const { data } = await api.put(`/expenses/${id}`, payload);
  return data;
}

export async function removeExpense(id) {
  const { data } = await api.delete(`/expenses/${id}`);
  return data;
}
