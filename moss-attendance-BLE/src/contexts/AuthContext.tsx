import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, type LoginUser } from "../api/auth";

const AUTH_CHECK_INTERVAL_MS = 15000;

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
  if (!localStorage.getItem("authToken")) {
    clearStoredAuth();
    return null;
  }

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
  const [isAuthReady, setIsAuthReady] = useState(() => !localStorage.getItem("authToken"));

  const isLoggedIn = isAuthReady && Boolean(localStorage.getItem("authToken") && user);

  useEffect(() => {
    let isMounted = true;

    async function validateSession() {
      const token = localStorage.getItem("authToken");

      if (!token) {
        clearStoredAuth();
        setUser(null);
        setIsAuthReady(true);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (!isMounted) return;

        localStorage.setItem("authUser", JSON.stringify(currentUser));
        setUser(currentUser);
      } catch {
        if (!isMounted) return;

        clearStoredAuth();
        setUser(null);
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    }

    const checkSession = () => {
      void validateSession();
    };

    if (localStorage.getItem("authToken")) {
      checkSession();
    }

    const intervalId = window.setInterval(checkSession, AUTH_CHECK_INTERVAL_MS);
    window.addEventListener("focus", checkSession);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", checkSession);
    };
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
