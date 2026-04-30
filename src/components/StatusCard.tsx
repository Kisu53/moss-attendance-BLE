import styles from "./StatusCard.module.scss";

interface StatusCardProps {
  label: string;
  value: number;
  total?: number;
  unit?: string;
  variant?: "default" | "primary" | "warning" | "muted";
}

export default function StatusCard({
  label,
  value,
  total,
  unit = "명",
  variant = "default",
}: StatusCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.icon} />
      <div className={styles.body}>
        <div className={styles.label}>{label}</div>
        <div className={styles.valueRow}>
          <span className={styles.value}>{value}</span>
          {typeof total === "number" ? (
            <span className={styles.total}>/ {total}</span>
          ) : (
            <span className={styles.unit}>{unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}
