import { Outlet } from "react-router-dom";
import styles from "./AppLayout.module.scss";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainShell}>
        <Header />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
