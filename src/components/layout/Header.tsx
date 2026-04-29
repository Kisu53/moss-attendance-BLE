import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

//상단 바에 로고, 사용자 정보, 로그아웃 버튼 배치
export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>BLE 출퇴근 시스템</div>
      <div className={styles.right}>
        <span className={styles.user}>관리자</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}
