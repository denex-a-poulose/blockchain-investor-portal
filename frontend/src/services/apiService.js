import { auth } from "../firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

async function fetchWithAuth(endpoint, options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Authentication required");

  const token = await user.getIdToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function signupInvestor(name) {
  return fetchWithAuth("/portal/signup", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function signinInvestor() {
  return fetchWithAuth("/portal/signin");
}

export async function getOfferings() {
  const res = await fetch(`${API_URL}/portal/offerings`);
  return res.json();
}

export async function saveInvestorWallet(address) {
  return fetchWithAuth("/portal/wallets", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}
