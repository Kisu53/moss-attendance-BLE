import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const menuItems = [
    { path: "/dashboard", label: "대시보드" },
    { path: "/attendance", label: "출퇴근 기록" },
    { path: "/employees", label: "직원 관리" },
    { path: "/beacons", label: "비콘 관리" },
    { path: "/settings", label: "시스템 설정" },
];

export default function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive ? `${styles.link} ${styles.active}` : styles.link
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
