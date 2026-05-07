import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Login.module.scss";

function getLoginErrorMessage(error: unknown) {
  if (isAxiosError<{ error?: string }>(error)) {
    if (!error.response) {
      return "백엔드 서버에 연결할 수 없습니다. 서버 실행 상태를 확인해주세요.";
    }

    return error.response.data?.error ?? "로그인 요청을 처리할 수 없습니다.";
  }

  return "로그인 요청을 처리할 수 없습니다.";
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>TimeTag</div>
        <h1 className={styles.title}>BLE 출퇴근 시스템</h1>
        <p className={styles.subtitle}>관리자 로그인</p>

        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              setErrorMessage("");

              if (!credentialResponse.credential) {
                setErrorMessage("Google 인증 정보를 받을 수 없습니다.");
                return;
              }

              const data = await loginWithGoogle(credentialResponse.credential);
              login(data.token, data.user);
              navigate("/dashboard");
            } catch (error) {
              setErrorMessage(getLoginErrorMessage(error));
            }
          }}
          onError={() => {
            setErrorMessage("Google 로그인에 실패했습니다.");
          }}
        />

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </div>
    </div>
  );
}
