import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, type LoginUser } from "../api/auth";

interface AuthContextType {
  isAuthReady: boolean;
  isLoggedIn: boolean;
  user: LoginUser | null;
  login: (token: string, user: LoginUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function clearStoredAuth() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
}

function getStoredUser() {
  const storedUser = localStorage.getItem("authUser");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as LoginUser;
  } catch {
    clearStoredAuth();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginUser | null>(() => getStoredUser());
  const [isAuthReady, setIsAuthReady] = useState(false);

  const isLoggedIn = isAuthReady && Boolean(localStorage.getItem("authToken") && user);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      localStorage.removeItem("authUser");
      setUser(null);
      setIsAuthReady(true);
      return;
    }

    getCurrentUser()
      .then((currentUser) => {
        localStorage.setItem("authUser", JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => {
        clearStoredAuth();
        setUser(null);
      })
      .finally(() => {
        setIsAuthReady(true);
      });
  }, []);

  const login = (token: string, user: LoginUser) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(user));
    setUser(user);
    setIsAuthReady(true);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthReady, isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
