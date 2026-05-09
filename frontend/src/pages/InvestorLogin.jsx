import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { signinInvestor, signupInvestor } from "../services/apiService";
import { Rocket, Mail, Lock, ArrowRight } from "lucide-react";

export default function InvestorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      try {
        await signinInvestor();
      } catch (err) {
        // If signin fails because user doesn't exist in our DB, auto-onboard them
        await signupInvestor(result.user.displayName || "Investor");
      }
      navigate("/");
    } catch (err) {
      setError("Google Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await signinInvestor();
      navigate("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#f5f5f7] px-6 py-12">
      <div className="w-full max-w-[400px] animate-up">
        <div className="flex flex-col items-center mb-12">
          <div className="logo-mark mb-8 text-black">T</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Sign in.</h1>
          <p className="text-[#86868b] font-medium text-center">Manage your token assets globally.</p>
        </div>

        <div className="bg-[#161617] p-8 sm:p-10 rounded-[32px] border border-white/5 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#86868b] mb-2 ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="apple-input"
                placeholder="Required"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#86868b] mb-2 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="apple-input"
                placeholder="Required"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-xs font-semibold">{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full btn-apple py-4"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
              <span className="bg-[#161617] px-4 text-[#86868b] font-bold">Or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full btn-apple-secondary py-4 flex items-center justify-center gap-3 text-sm font-semibold"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
            Continue with Google
          </button>

          <p className="text-center mt-10 text-[13px] text-[#86868b] font-medium">
            Don't have an account? <Link to="/signup" className="text-[#0071e3] font-semibold hover:underline">Create yours now.</Link>
          </p>
        </div>
        
        <div className="mt-16 text-center">
           <p className="text-[11px] text-[#424245] font-medium leading-relaxed">
             TokenPortal Security Engine &copy; 2026 <br />
             Global Financial Standards. All rights reserved.
           </p>
        </div>
      </div>
    </div>
  );
}
