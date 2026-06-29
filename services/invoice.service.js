const API_URL = "https://sbms-backend.onrender.com/api/invoices";
// ✅ FIXED (NO credentials)
const fetchWithAuth = (url, options = {}) => {
  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};

export const getInvoices = async ({ search = "", status = "", page = 1, limit = 10 } = {}) => {
  try {
    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (status && status !== "All Status") params.append("status", status);
    params.append("page", page);
    params.append("limit", limit);

    const response = await fetchWithAuth(`${API_URL}?${params.toString()}`);
    const data = await response.json();
    return data.success
      ? { invoices: data.data, pagination: data.pagination }
      : { invoices: [], pagination: null };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { invoices: [], pagination: null };
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const response = await fetchWithAuth(API_URL, {
      method: "POST",
      body: JSON.stringify(invoiceData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};