import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import WagmiProviderSetup from "./components/WagmiProviderSetup";
import Marketplace from "./pages/Marketplace";
import InvestorLogin from "./pages/InvestorLogin";
import InvestorSignup from "./pages/InvestorSignup";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <WagmiProviderSetup>
          <Routes>
            <Route path="/login" element={<InvestorLogin />} />
            <Route path="/signup" element={<InvestorSignup />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } />
          </Routes>
        </WagmiProviderSetup>
      </AuthProvider>
    </Router>
  );
}
