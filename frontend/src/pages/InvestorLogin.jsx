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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">Welcome Back</h1>
          <p className="text-[var(--color-text-muted)] font-medium">Access your token portfolio and the marketplace.</p>
        </div>

        <div className="retail-glass p-8 rounded-[2rem] border border-white/5 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:border-emerald-500 outline-none transition-all"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-bold bg-red-400/10 p-4 rounded-xl border border-red-400/20">{error}</p>}

            <button
              disabled={loading}
              type="submit"
              className="btn-invest w-full flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Signing in..." : "Access Marketplace"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#111827] px-4 text-[var(--color-text-muted)] font-bold tracking-widest">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-bold"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>

          <p className="text-center mt-8 text-sm text-[var(--color-text-muted)] font-medium">
            New to the portal? <Link to="/signup" className="text-emerald-400 font-bold hover:underline">Create an Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
