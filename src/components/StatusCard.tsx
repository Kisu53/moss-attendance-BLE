import styles from "./StatusCard.module.css";

interface StatusCardProps {
    label: string;
    value: number;
    unit?: string;
    //varitent prop에 따라 카드 스타일 변경
    variant?: "default" | "primary" | "warning" | "muted";
}

export default function StatusCard({
    label,
    value,
    unit = "명",
    variant = "default",
}: StatusCardProps) {
    return (
        <div className={`${styles.card} ${styles[variant]}`}>
            <div className={styles.label}>{label}</div>
            <div className={styles.valueRow}>
                <span className={styles.value}>{value}</span>
                <span className={styles.unit}>{unit}</span>
            </div>
        </div>
    );
}
