// 로그인한 사용자만 특정 페이지에 접근 가능하도록 하는 컴포넌트, 로그인 안됐으면 /login 라우트로 보내기

import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();

  //isLoggedIn state가 False이면 /login 으로, replace로 브라우저 히스토리 교체
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
