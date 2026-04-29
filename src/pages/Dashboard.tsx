import { useFetch } from "../utils/useFetch";
import StatusCard from "../components/StatusCard";
import RealTimeFeed from "../components/RealTimeFeed";
import DeviceStatusCard from "../components/DeviceStatusCard";
import type { AttendanceTodayResponse } from "../types/api";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { data, status, errorMessage } = useFetch<AttendanceTodayResponse>(
    "/api/v1/attendance/today"
  );

  return (
    <div>
      <h1 className={styles.title}>대시보드</h1>
      <p className={styles.subtitle}>
        {data ? `${data.date} 기준 오늘의 출근 현황` : "오늘의 출근 현황"}
      </p>

      <section className={styles.cardSection}>
        {status === "loading" && <div className={styles.message}>로딩 중...</div>}
        {status === "error" && <div className={styles.message}>오류: {errorMessage}</div>}
        {status === "success" && data && (
          <div className={styles.cardGrid}>
            <StatusCard label="전체 직원" value={data.total} variant="default" />
            <StatusCard label="출근" value={data.checkedIn} variant="primary" />
            <StatusCard label="미출근" value={data.notCheckedIn} variant="warning" />
            <StatusCard label="퇴근" value={data.checkedOut} variant="muted" />
          </div>
        )}
      </section>

      <div className={styles.bottomGrid}>
        <RealTimeFeed />
        <DeviceStatusCard />
      </div>
    </div>
  );
}
