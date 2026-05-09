import { useState, useEffect } from "react";
import { LogOut, Wallet, Rocket, ShieldCheck, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { getOfferings, saveInvestorWallet, getUserWallets } from "../services/apiService";
import InvestModal from "../components/InvestModal";

export default function Marketplace() {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile, logout } = useAuth();
  const [selectedToken, setSelectedToken] = useState(null);
  const [savedWallets, setSavedWallets] = useState([]);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState("");
  
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    loadOfferings();
    fetchWallets();
  }, []);

  async function fetchWallets() {
    try {
      const wallets = await getUserWallets();
      setSavedWallets(wallets);
    } catch (err) {
      console.error("Failed to fetch wallets:", err);
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      saveInvestorWallet(address).then(() => fetchWallets()).catch(console.error);
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (address && !selectedWalletAddress && savedWallets.length === 0) {
      setSelectedWalletAddress(address.toLowerCase());
    } else if (savedWallets.length > 0 && !selectedWalletAddress) {
      setSelectedWalletAddress(savedWallets[0].address.toLowerCase());
    }
  }, [address, savedWallets, selectedWalletAddress]);

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
    <div className="min-h-screen bg-black text-[#f5f5f7]">
      {/* Navbar */}
      <nav className="apple-nav">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="logo-mark group-hover:scale-105 transition-transform">T</div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">TokenPortal</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            {!isConnected ? (
              <button 
                onClick={() => connect({ connector: injected() })} 
                className="text-sm font-medium text-[#0071e3] hover:underline"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <select 
                    value={selectedWalletAddress}
                    onChange={(e) => setSelectedWalletAddress(e.target.value)}
                    className="bg-transparent text-[12px] font-medium text-[#86868b] outline-none appearance-none cursor-pointer hover:text-white"
                  >
                    {address && <option value={address.toLowerCase()} className="bg-[#161617]">{address.slice(0,6)}...{address.slice(-4)}</option>}
                    {savedWallets.map(w => (
                      <option key={w.id} value={w.address.toLowerCase()} className="bg-[#161617]">
                        {w.address.slice(0,6)}...{w.address.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={() => disconnect()} className="text-[12px] text-red-500/80 hover:text-red-500">
                  Disconnect
                </button>
              </div>
            )}
            
            <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />
            
            <div className="flex items-center gap-3">
              <button onClick={logout} className="text-sm font-medium text-[#86868b] hover:text-white transition-colors">Sign Out</button>
              <div className="w-8 h-8 rounded-full bg-[#1d1d1f] overflow-hidden border border-white/5">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.email}`} alt="avatar" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="content-container pt-20 pb-16 animate-up">
        <h1 className="hero-title">
          Invest in the next <br />
          <span className="text-[#86868b]">global standard.</span>
        </h1>
        <p className="hero-subtitle max-w-2xl mx-auto">
          High-performance tokenized assets from verified projects. 
          The future of ownership is here.
        </p>
      </header>

      {/* Main Grid */}
      <main className="content-container pb-40">
        <div className="flex items-end justify-between mb-10 animate-up" style={{ animationDelay: '0.1s' }}>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Active Projects</h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="aspect-[4/5] rounded-[24px] bg-[#161617] animate-pulse" />
            ))}
          </div>
        ) : offerings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-[#161617] rounded-[24px] border border-white/5">
             <div className="logo-mark mb-6 opacity-20">T</div>
            <h3 className="text-xl font-bold mb-2">No offerings available</h3>
            <p className="text-[#86868b] text-sm">Please check back later for new updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            {offerings.map((token, idx) => (
              <div 
                key={token.id} 
                className="apple-card group animate-up" 
                style={{ animationDelay: `${0.1 + idx * 0.1}s` }}
              >
                <div className="p-8 flex flex-col h-full">
                  {/* Icon & Status */}
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 rounded-3xl bg-white text-black flex items-center justify-center text-2xl font-black shadow-2xl">
                      {token.symbol?.slice(0, 1)}
                    </div>
                    <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest py-1 px-2.5 bg-white/5 rounded-full">Active</span>
                  </div>

                  {/* Info */}
                  <div className="mb-10">
                    <h3 className="text-2xl font-bold tracking-tight mb-2 group-hover:text-[#0071e3] transition-colors">{token.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#86868b]">{token.symbol}</span>
                      <span className="text-[#333]">•</span>
                      <span className="text-xs font-bold text-[#0071e3]">Ethereum Mainnet</span>
                    </div>
                  </div>

                  {/* Data Points */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 mb-8">
                    <div>
                      <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-1">Decimals</p>
                      <p className="text-lg font-bold">{token.decimals}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest mb-1">Status</p>
                      <p className="text-lg font-bold text-emerald-500">Live</p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-auto">
                    <button 
                      onClick={() => setSelectedToken(token)}
                      className="w-full btn-apple py-4 text-base"
                    >
                      Invest
                    </button>
                    <p className="text-[10px] text-center mt-4 text-[#424245] font-mono">
                      {token.contractAddress?.slice(0, 10)}...{token.contractAddress?.slice(-8)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Overlay */}
      {selectedToken && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-up">
          <div className="absolute inset-0" onClick={() => setSelectedToken(null)} />
          <div className="relative w-full max-w-[540px]">
             <InvestModal 
                token={selectedToken} 
                onClose={() => setSelectedToken(null)} 
                selectedWalletAddress={selectedWalletAddress}
                setSelectedWalletAddress={setSelectedWalletAddress}
                savedWallets={savedWallets}
              />
          </div>
        </div>
      )}
    </div>
  );
}
