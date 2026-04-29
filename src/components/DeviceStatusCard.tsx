import { useFetch } from "../utils/useFetch";
import type { DeviceStatus, DeviceStatusResponse } from "../types/api";
import styles from "./DeviceStatusCard.module.css";

export default function DeviceStatusCard() {
    const { data, status, errorMessage } = useFetch<DeviceStatusResponse>(
        "/api/v1/dashboard/device-status",
    );

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
            <h2 className={styles.title}>디바이스 상태</h2>
            <div className={styles.deviceList}>
                {data.data.map((device) => (
                    <DeviceItem key={device.deviceId} device={device} />
                ))}
            </div>
        </section>
    );
}

function DeviceItem({ device }: { device: DeviceStatus }) {
    const uptimeText = formatUptime(device.uptimeSeconds);

    return (
        <div className={styles.device}>
            <div className={styles.deviceHeader}>
                <span className={styles.deviceId}>{device.deviceId}</span>
                <span
                    className={`${styles.statusBadge} ${
                        device.online ? styles.online : styles.offline
                    }`}
                >
                    {device.online ? "온라인" : "오프라인"}
                </span>
            </div>
            <div className={styles.deviceMeta}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>업타임</span>
                    <span className={styles.metaValue}>{uptimeText}</span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Wi-Fi</span>
                    <span className={styles.metaValue}>{device.wifiRssi} dBm</span>
                </div>
            </div>
        </div>
    );
}

function formatUptime(seconds: number): string {
    //시간 분해
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}일 ${hours}시간`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
}
