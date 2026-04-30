import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Header.module.scss";

const menuItems = [
  { path: "/dashboard", label: "대시보드" },
  { path: "/attendance", label: "출퇴근 기록" },
  { path: "/employees", label: "직원 관리" },
  { path: "/beacons", label: "비콘 관리" },
  { path: "/settings", label: "설정" },
];

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/dashboard" className={styles.logo}>
          TimeTag
        </NavLink>

        <nav className={styles.nav} aria-label="주요 메뉴">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.right}>
          <span className={styles.user}>김민준 · 개발팀</span>
          <button className={styles.avatarButton} onClick={handleLogout} aria-label="로그아웃">
            김
          </button>
        </div>
      </div>
    </header>
  );
}
