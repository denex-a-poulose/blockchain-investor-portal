import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { signupInvestor } from "../services/apiService";
import { useNavigate, Link } from "react-router-dom";
import { Rocket, User, Mail, Lock, ArrowRight } from "lucide-react";

export default function InvestorSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await signupInvestor(result.user.displayName || "Investor");
      navigate("/");
    } catch (err) {
      setError("Google Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await signupInvestor(name);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#f5f5f7] px-6 py-12">
      <div className="w-full max-w-[400px] animate-up">
        <div className="flex flex-col items-center mb-12">
          <div className="logo-mark mb-8 text-black">T</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Join us.</h1>
          <p className="text-[#86868b] font-medium text-center">Create your global tokenized portfolio.</p>
        </div>

        <div className="bg-[#161617] p-8 sm:p-10 rounded-[32px] border border-white/5 shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#86868b] mb-2 ml-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="apple-input"
                placeholder="Required"
              />
            </div>

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
                placeholder="Min. 8 characters"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-xs font-semibold leading-relaxed">{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full btn-apple py-4"
            >
              {loading ? "Creating Account..." : "Create Account"}
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
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full btn-apple-secondary py-4 flex items-center justify-center gap-3 text-sm font-semibold"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
            Continue with Google
          </button>

          <p className="text-center mt-10 text-[13px] text-[#86868b] font-medium">
            Already have an account? <Link to="/login" className="text-[#0071e3] font-semibold hover:underline">Sign in now.</Link>
          </p>
        </div>

        <div className="mt-16 text-center">
           <p className="text-[11px] text-[#424245] font-medium leading-relaxed">
             Secure asset management &copy; 2026 <br />
             Global Financial Standards. All rights reserved.
           </p>
        </div>
      </div>
    </div>
  );
}
