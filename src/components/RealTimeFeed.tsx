import { usePolling } from "../utils/usePolling";
import { fetchRealtime } from "../api/dashboard";
import { formatTime } from "../utils/date";
import styles from "./RealTimeFeed.module.scss";
import type { RecentDetection } from "../types/api";

const POLLING_INTERVAL_MS = 5000;

export default function RealTimeFeed() {
  const { data, status, errorMessage } = usePolling(() => fetchRealtime(), POLLING_INTERVAL_MS);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>실시간 감지 피드</h2>
        <span className={styles.syncText}>5초 갱신</span>
      </div>

      <div className={styles.tableHeader}>
        <span>시각</span>
        <span>직원</span>
        <span>RSSI</span>
        <span>액션</span>
      </div>

      {status === "loading" && !data && <div className={styles.message}>로딩 중...</div>}

      {status === "error" && (
        <div className={styles.message}>데이터를 불러오지 못했습니다: {errorMessage}</div>
      )}

      {data && data.data.length === 0 && (
        <div className={styles.message}>최근 감지 기록이 없습니다.</div>
      )}

      {data && data.data.length > 0 && (
        <div className={styles.list}>
          {data.data.map((detection, index) => (
            <DetectionItem key={detection.id} detection={detection} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}

function DetectionItem({ detection, index }: { detection: RecentDetection; index: number }) {
  const action = index < 3 ? "재감지" : "출근";
  const actionClass = action === "재감지" ? styles.redetect : styles.checkIn;

  return (
    <div className={styles.item}>
      <span className={styles.time}>{formatTime(detection.detectedAt)}</span>
      <span className={styles.name}>{detection.employeeName}</span>
      <span className={styles.rssi}>{detection.rssi}</span>
      <span className={`${styles.action} ${actionClass}`}>{action}</span>
    </div>
  );
}
