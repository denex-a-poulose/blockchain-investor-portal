import { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { initiatePurchase, verifyPayment, getUserWallets } from "../services/apiService";
import { X, CreditCard, Wallet, AlertCircle, ShoppingCart, CheckCircle2 } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Use a placeholder test key if env var is missing
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx");

function CheckoutForm({ onSuccess, onError, token, quantity, tokenPrice, totalPrice, address }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });

    if (error) {
      onError(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await verifyPayment({
            paymentIntentId: paymentIntent.id,
            meta: {
              tokenId: token.id,
              tokenName: token.name,
              tenantId: token.tenantId,
              quantity,
              pricePerToken: tokenPrice,
              totalPrice,
              walletAddress: address
            }
        });
        onSuccess();
      } catch (err) {
        onError("Payment recorded but verification failed.");
      }
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
        <PaymentElement options={{ theme: 'night' }} />
      </div>
      <button 
        disabled={isProcessing || !stripe || !elements} 
        className="w-full btn-invest flex items-center justify-center gap-3 py-5 text-lg"
      >
        {isProcessing ? "Processing..." : `Pay $${totalPrice}`}
      </button>
    </form>
  );
}

export default function InvestModal({ token, onClose, selectedWalletAddress, setSelectedWalletAddress, savedWallets }) {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const tokenPrice = parseFloat(token.pricePerToken || token.price || 0);
  const totalPrice = (quantity * tokenPrice).toFixed(2);

  const handleInitiate = async () => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    if (parseFloat(totalPrice) < 0.50) {
      setError("Stripe requires a minimum payment of $0.50. Please increase the quantity or token price.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create Order / PaymentIntent on Backend
      const order = await initiatePurchase({
        amount: parseFloat(totalPrice),
        tokenId: token.id,
        tokenName: token.name,
        tenantId: token.tenantId,
        quantity: parseInt(quantity),
        pricePerToken: tokenPrice,
        walletAddress: selectedWalletAddress || address
      });

      if (order.clientSecret) {
        setClientSecret(order.clientSecret);
      } else {
        throw new Error("Failed to get client secret from backend");
      }
    } catch (err) {
      console.error("Investment Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-fade-in">
        <div className="bg-[#1c1c1e] border border-white/10 w-full max-w-md rounded-[30px] p-12 text-center shadow-2xl animate-fade-in-up">
            <div className="w-20 h-20 bg-[#1d1d1f] rounded-full flex items-center justify-center text-[#2997ff] mx-auto mb-8 border border-white/5">
                <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-3 text-[#f5f5f7]">Investment Received.</h2>
            <p className="text-[#86868b] mb-10 font-medium leading-relaxed">Your transaction is being processed and will be visible on the blockchain shortly.</p>
            <button 
              onClick={onClose} 
              className="w-full py-4 bg-[#f5f5f7] text-[#000000] rounded-full font-bold transition-all hover:bg-white"
            >
                Done
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xl overflow-y-auto animate-up">
      <div className="bg-[#1c1c1e] border border-white/10 w-full max-w-[500px] rounded-[32px] overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="relative p-6 sm:p-8 border-b border-white/5">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 sm:right-8 sm:top-8 text-[#86868b] hover:text-[#f5f5f7] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2d2d2f] flex items-center justify-center text-white border border-white/5">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f5f5f7]">{token.name}</h2>
              <p className="text-[13px] text-[#86868b] font-medium">Secure Payment</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-medium">
              {error}
            </div>
          )}

          {!clientSecret ? (
            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#86868b] mb-3 ml-1">Receiving Address</label>
                <div className="relative">
                  <select 
                    value={selectedWalletAddress}
                    onChange={(e) => setSelectedWalletAddress(e.target.value)}
                    className="apple-input pr-12"
                  >
                    {address && (
                      <option value={address.toLowerCase()}>Active: {address.slice(0, 6)}...{address.slice(-4)}</option>
                    )}
                    {savedWallets.map(w => (
                      <option key={w.id} value={w.address.toLowerCase()}>
                        {w.address.slice(0, 6)}...{w.address.slice(-4)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b]">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#86868b] mb-3 ml-1">Quantity</label>
                  <div className="flex items-center bg-[#1d1d1f] rounded-xl p-1 border border-[#424245]">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg hover:bg-white/5 text-[#86868b] font-bold"
                    >-</button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-transparent flex-1 text-center font-bold text-sm outline-none text-[#f5f5f7]"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg hover:bg-white/5 text-[#86868b] font-bold"
                    >+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#86868b] mb-3 ml-1">Total</label>
                  <div className="h-[52px] flex items-center justify-center bg-[#1d1d1f]/50 border border-[#424245] rounded-xl">
                    <span className="text-lg font-bold tracking-tight text-[#f5f5f7]">${totalPrice}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleInitiate}
                disabled={loading}
                className="w-full btn-apple py-4.5 h-14 text-base"
              >
                {loading ? "Processing..." : isConnected ? "Review Investment" : "Connect Wallet"}
              </button>
            </div>
          ) : (
            <div className="animate-up">
              <div className="mb-8 p-6 bg-[#1d1d1f] rounded-2xl border border-white/5 flex justify-between items-center">
                 <span className="text-[#86868b] font-medium text-sm">Order Total</span>
                 <span className="text-xl font-bold tracking-tight text-[#f5f5f7]">${totalPrice}</span>
              </div>
              
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm 
                  onSuccess={() => setSuccess(true)} 
                  onError={(err) => setError(err)} 
                  token={token}
                  quantity={quantity}
                  tokenPrice={tokenPrice}
                  totalPrice={totalPrice}
                  address={selectedWalletAddress || address}
                />
              </Elements>

              <button 
                onClick={() => setClientSecret("")} 
                className="mt-8 text-[13px] text-[#0071e3] hover:underline w-full text-center font-medium"
              >
                Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
