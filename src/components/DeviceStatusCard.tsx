import { useFetch } from "../utils/useFetch";
import { fetchDeviceStatus } from "../api/dashboard";
import styles from "./DeviceStatusCard.module.scss";
import type { DeviceStatus } from "../types/api";

export default function DeviceStatusCard() {
  const { data, status, errorMessage } = useFetch(() => fetchDeviceStatus());

  if (status === "loading") {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>디바이스 상태</h2>
        <div className={styles.message}>로딩 중...</div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>디바이스 상태</h2>
        <div className={styles.message}>오류: {errorMessage}</div>
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className={styles.section}>
      {data.data.map((device) => (
        <DeviceItem key={device.deviceId} device={device} />
      ))}
    </section>
  );
}

function DeviceItem({ device }: { device: DeviceStatus }) {
  const uptimeText = formatUptime(device.uptimeSeconds);

  return (
    <div className={styles.device}>
      <div className={styles.deviceHeader}>
        <span className={styles.deviceId}>{device.deviceId}</span>
        <span className={`${styles.statusBadge} ${device.online ? styles.online : styles.offline}`}>
          <span className={styles.statusDot} />
          {device.online ? "온라인" : "오프라인"}
        </span>
      </div>
      <div className={styles.deviceMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>HB</span>
          <span className={styles.metaValue}>{formatTimeAgo(device.lastHeartbeat)}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>업타임</span>
          <span className={styles.metaValue}>{uptimeText}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>RSSI</span>
          <span className={styles.metaValue}>{device.wifiRssi} dBm</span>
        </div>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function formatTimeAgo(isoString: string): string {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
  if (diffSeconds < 60) return `${diffSeconds}초 전`;
  return `${Math.floor(diffSeconds / 60)}분 전`;
}
