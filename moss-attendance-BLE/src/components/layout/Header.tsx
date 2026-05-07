import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Header.module.scss";

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.systemStatus}>
        <span className={styles.statusDot} />
        BLE 출퇴근 시스템
      </div>
      <div className={styles.right}>
        <span className={styles.user}>김기수 · 기술연구소</span>
        <button className={styles.avatarButton} onClick={handleLogout} aria-label="로그아웃">
          Logout
        </button>
      </div>
    </header>
  );
}
