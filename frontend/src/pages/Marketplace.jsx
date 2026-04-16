import { useState, useEffect } from "react";
import { getOfferings, saveInvestorWallet } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { LogOut, Wallet, Rocket, ShieldCheck, TrendingUp } from "lucide-react";

export default function Marketplace() {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile, logout } = useAuth();
  
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    loadOfferings();
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      saveInvestorWallet(address).catch(console.error);
    }
  }, [isConnected, address]);

  async function loadOfferings() {
    try {
      const data = await getOfferings();
      setOfferings(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Navbar */}
      <nav className="border-b border-[var(--color-border)] retail-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">Token<span className="text-emerald-400">Portal</span></span>
          </div>

          <div className="flex items-center gap-4">
            {!isConnected ? (
              <button onClick={() => connect({ connector: injected() })} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold transition-all border border-white/10">
                <Wallet className="w-4 h-4" /> Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Wallet</p>
                  <p className="text-xs font-mono opacity-70">{address.slice(0,6)}...{address.slice(-4)}</p>
                </div>
                <button onClick={() => disconnect()} className="p-2 hover:bg-white/5 rounded-lg text-[var(--color-text-muted)]">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="h-8 w-[1px] bg-white/10 mx-2" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.email}`} alt="avatar" />
              </div>
              <button onClick={logout} className="text-sm font-bold text-[var(--color-text-muted)] hover:text-white transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-6">
          <TrendingUp className="w-3 h-3" /> Marketplace Live
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
          Invest in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Future</span>
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
          Access exclusive token offerings curated by top organizations. Secure, transparent, and built on the blockchain.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 retail-glass rounded-2xl border border-white/5 text-left">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold mb-1">Secure Assets</h3>
            <p className="text-xs text-[var(--color-text-muted)]">All tokens are verified and compiled by our management engine.</p>
          </div>
          <div className="p-6 retail-glass rounded-2xl border border-white/5 text-left">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="font-bold mb-1">Growth Focused</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Early-stage access to innovative blockchain projects.</p>
          </div>
          <div className="p-6 retail-glass rounded-2xl border border-white/5 text-left">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-bold mb-1">Fast Deploy</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Buy and manage tokens instantly with your connected wallet.</p>
          </div>
        </div>
      </header>

      {/* Main Marketplace */}
      <main className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold">Featured Offerings</h2>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-white/5 rounded-lg text-xs font-bold border border-white/10 hover:bg-white/10 transition-colors">All Categories</button>
             <button className="px-4 py-2 bg-white/5 rounded-lg text-xs font-bold border border-white/10 hover:bg-white/10 transition-colors">Popular</button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="card-marketplace h-96 animate-pulse bg-white/5 border-white/10" />
            ))}
          </div>
        ) : offerings.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
            <Rocket className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-xl font-bold mb-2">No offerings available yet</h3>
            <p className="text-[var(--color-text-muted)]">Check back soon for new token launches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {offerings.map(token => (
              <div key={token.id} className="card-marketplace flex flex-col group">
                <div className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                      {token.symbol?.slice(0, 4)}
                    </div>
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 border border-white/10">
                      Standard ERC-20
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{token.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-emerald-400 font-bold font-mono text-sm">{token.symbol}</span>
                    <span className="text-[var(--color-text-muted)] opacity-50">•</span>
                    <span className="text-xs text-[var(--color-text-muted)] font-bold">Launch: Active</span>
                  </div>
                  
                  <div className="space-y-4 py-4 border-y border-white/5 mb-6">
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-[var(--color-text-muted)] font-medium">Decimals</span>
                       <span className="font-bold font-mono">{token.decimals}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                       <span className="text-[var(--color-text-muted)] font-medium">Network</span>
                       <span className="font-bold text-blue-400">Sepolia Testnet</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 pt-0 mt-auto">
                   <button className="btn-invest w-full flex items-center justify-center gap-2 text-sm">
                     Invest Now <TrendingUp className="w-4 h-4" />
                   </button>
                   <p className="text-[10px] text-center mt-4 text-[var(--color-text-muted)] font-medium opacity-50">
                     Smart Contract Verified 0x...{token.contractAddress?.slice(-6)}
                   </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
