import { auth } from "../firebase";

/**
 * apiService.js
 * Centralized service for communication between the Investor Portal and Node.js Backend.
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/**
 * Authenticated fetch helper. 
 * Automatically attaches the Firebase ID token to headers.
 */
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
  
  // Attempt to parse JSON; handle non-JSON responses
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// --- 1. Investor Authentication & Profile ---

export async function signupInvestor(name) {
  return fetchWithAuth("/portal/signup", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function signinInvestor() {
  return fetchWithAuth("/portal/signin");
}

export async function saveInvestorWallet(address) {
  return fetchWithAuth("/portal/wallets", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

// --- 2. Marketplace & Offerings ---

/**
 * Fetches available token offerings.
 * This is public, so it does not require authentication headers.
 */
export async function getOfferings() {
  const res = await fetch(`${API_URL}/portal/offerings`);
  if (!res.ok) throw new Error("Failed to fetch offerings");
  return res.json();
}

// --- 3. Order & Purchase Flow ---

/**
 * Initiates a Stripe PaymentIntent.
 * @param {Object} orderData - { amount, tokenId, quantity, pricePerToken, walletAddress }
 */
export async function initiatePurchase(orderData) {
  return fetchWithAuth("/portal/create-order", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

/**
 * Verifies the Stripe payment on the backend.
 * @param {Object} paymentData - { paymentIntentId, meta }
 */
export async function verifyPayment(paymentData) {
  return fetchWithAuth("/portal/verify-payment", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}

/**
 * Fetches the status of a specific order from the 'orders' collection.
 * @param {string} orderId 
 */
export async function getOrderStatus(orderId) {
  return fetchWithAuth(`/portal/orders/${orderId}`);
}