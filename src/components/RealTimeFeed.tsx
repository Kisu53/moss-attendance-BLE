import { usePolling } from "../utils/usePolling";
import { fetchRealtime } from "../api/dashboard";
import { formatTime } from "../utils/date";
import styles from "./RealTimeFeed.module.css";
import type { RecentDetection } from "../types/api";

const POLLING_INTERVAL_MS = 5000;

export default function RealTimeFeed() {
  const { data, status, errorMessage } = usePolling(() => fetchRealtime(), POLLING_INTERVAL_MS);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>실시간 감지 피드</h2>
        <div className={styles.indicator}>
          <span className={styles.dot} />
          <span className={styles.indicatorText}>5초마다 자동 갱신</span>
        </div>
      </div>

      {status === "loading" && !data && <div className={styles.message}>로딩 중...</div>}

      {status === "error" && (
        <div className={styles.message}>데이터를 불러오지 못했습니다: {errorMessage}</div>
      )}

      {data && data.data.length === 0 && (
        <div className={styles.message}>최근 감지 기록이 없습니다.</div>
      )}

      {data && data.data.length > 0 && (
        <ul className={styles.list}>
          {data.data.map((detection) => (
            <DetectionItem key={detection.id} detection={detection} />
          ))}
        </ul>
      )}
    </section>
  );
}

function DetectionItem({ detection }: { detection: RecentDetection }) {
  return (
    <li className={styles.item}>
      <div className={styles.itemMain}>
        <span className={styles.itemName}>{detection.employeeName}</span>
        <span className={styles.itemBeacon}>{detection.beaconLabel}</span>
      </div>
      <div className={styles.itemMeta}>
        <span className={styles.itemTime}>{formatTime(detection.detectedAt)}</span>
        <span className={styles.itemRssi}>{detection.rssi} dBm</span>
      </div>
    </li>
  );
}
