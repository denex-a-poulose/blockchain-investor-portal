import { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { initiatePurchase, verifyPayment } from "../services/apiService";
import { X, CreditCard, Wallet, AlertCircle, ShoppingCart, CheckCircle2 } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Use a placeholder test key if env var is missing
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx");

function CheckoutForm({ onSuccess, onError, token, quantity, totalPrice, address }) {
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

export default function InvestModal({ token, onClose }) {
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
        quantity: parseInt(quantity),
        pricePerToken: tokenPrice,
        walletAddress: address
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[#0f172a] border border-emerald-500/30 w-full max-w-md rounded-[2rem] p-10 text-center shadow-2xl animate-in fade-in zoom-in">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black mb-2">Payment Successful!</h2>
            <p className="text-white/50 mb-8 font-medium">Your investment has been recorded in the blockchain ledger.</p>
            <button onClick={onClose} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                Back to Marketplace
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 my-8">
        {/* Header */}
        <div className="relative p-6 border-b border-white/5">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold">Invest in {token.name}</h2>
          </div>
          <p className="text-sm text-white/40">Secure checkout powered by Stripe</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {!clientSecret ? (
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Quantity</label>
                <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-2 border border-white/5">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-xl font-bold"
                  >-</button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-transparent flex-1 text-center font-bold text-xl outline-none"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center text-xl font-bold"
                  >+</button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-emerald-500/5 rounded-2xl p-6 border border-emerald-500/10">
                  <div className="flex justify-between items-center text-[var(--color-text-muted)]">
                    <span>Price per Token</span>
                    <span className="font-bold text-white">${tokenPrice}</span>
                  </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-emerald-400/80 font-bold uppercase tracking-widest text-[10px]">Total Investment</span>
                  <span className="text-2xl font-black text-emerald-400">${totalPrice}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleInitiate}
                disabled={loading}
                className="w-full btn-invest flex items-center justify-center gap-3 py-5 text-lg"
              >
                {loading ? (
                  "Initiating..."
                ) : !isConnected ? (
                  <> <Wallet className="w-5 h-5" /> Connect Wallet to Buy </>
                ) : (
                  <> <CreditCard className="w-5 h-5" /> Proceed to Checkout </>
                )}
              </button>

              {!isConnected && (
                <p className="text-center text-[10px] text-white/30 uppercase tracking-widest font-bold">
                  Wallet address is required for token allocation
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4 bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 flex justify-between items-center">
                 <span className="text-white/40 text-sm">Total to Pay</span>
                 <span className="font-bold text-lg">${totalPrice}</span>
              </div>
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                <CheckoutForm 
                  onSuccess={() => setSuccess(true)} 
                  onError={(err) => setError(err)} 
                  token={token}
                  quantity={quantity}
                  totalPrice={totalPrice}
                  address={address}
                />
              </Elements>
              <button onClick={() => setClientSecret("")} className="mt-4 text-xs text-white/40 hover:text-white w-full text-center">
                Back to Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
