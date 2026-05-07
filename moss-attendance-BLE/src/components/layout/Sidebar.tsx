import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.scss";

const menuItems = [
  { path: "/dashboard", label: "대시보드", icon: "대" },
  { path: "/attendance", label: "출퇴근 기록", icon: "출" },
  { path: "/employees", label: "직원 관리", icon: "직" },
  { path: "/beacons", label: "비콘 관리", icon: "비" },
  { path: "/settings", label: "설정", icon: "설" },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <NavLink to="/dashboard" className={styles.logo}>
        <span className={styles.logoMark}>T</span>
        <span>TimeTag</span>
      </NavLink>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <span className={styles.footerLabel}>Gateway</span>
        <strong>ESP32-6F-001</strong>
        <span className={styles.online}>온라인</span>
      </div>
    </aside>
  );
}
