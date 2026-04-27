import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = () => setIsLoggedIn(true);
    const logout = () => setIsLoggedIn(false);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {/*Provider로 감싸진 모든 children이 여기에 렌더링*/}
            {children}
        </AuthContext.Provider>
    );
}

/* 커스텀 훅 useAuth 
  다른 컴포넌트에서 useContext(AuthContext)라고 쓰지 않고 useAuth만 호출, context가 undefined인지 체크하는 로직 중앙화 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
