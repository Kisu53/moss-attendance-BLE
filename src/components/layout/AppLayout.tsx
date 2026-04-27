import { Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
    return (
        <div className={styles.layout}>
            <Header />
            <div className={styles.body}>
                <Sidebar />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
