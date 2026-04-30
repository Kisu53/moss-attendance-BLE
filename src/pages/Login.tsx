import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./Login.module.scss";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
    navigate("/dashboard");
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>TimeTag</div>
        <h1 className={styles.title}>BLE 출퇴근 시스템</h1>
        <p className={styles.subtitle}>관리자 로그인</p>
        <button className={styles.button} onClick={handleLogin}>
          로그인
        </button>
      </div>
    </div>
  );
}
