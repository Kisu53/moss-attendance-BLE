import { Outlet } from "react-router-dom";
import styles from "./AppLayout.module.scss";
import Header from "./Header";

export default function AppLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
