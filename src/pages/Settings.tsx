import { useFetch } from "../utils/useFetch";
import { fetchConfig } from "../api/config";
import styles from "./Settings.module.css";

export default function Settings() {
  const { data, status, errorMessage } = useFetch(() => fetchConfig());

  const configItems = data?.data ?? [];

  return (
    <div>
      <h1 className={styles.title}>시스템 설정</h1>
      <p className={styles.subtitle}>ESP32 디바이스 동작과 출퇴근 처리 규칙을 관리합니다.</p>

      {status === "loading" && <div className={styles.message}>로딩 중...</div>}

      {status === "error" && (
        <div className={styles.message}>
          <p>설정을 불러오지 못했습니다.</p>
          <p className={styles.errorDetail}>{errorMessage}</p>
        </div>
      )}

      {status === "success" && (
        <div className={styles.placeholder}>
          <p>설정 항목 {configItems.length}개를 받아왔습니다.</p>
          <pre className={styles.preview}>{JSON.stringify(configItems, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
