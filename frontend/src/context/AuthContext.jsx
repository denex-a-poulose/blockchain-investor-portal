import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { signinInvestor } from "../services/apiService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (idUser) => {
      setUser(idUser);
      if (idUser) {
        try {
          const p = await signinInvestor();
          setProfile(p);
        } catch (e) {
          console.error("No portal profile found yet");
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const logout = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
