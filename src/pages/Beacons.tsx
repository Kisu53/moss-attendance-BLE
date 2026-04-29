import { useFetch } from "../utils/useFetch";
import { fetchBeacons } from "../api/beacons";
import type { Beacon } from "../types/api";
import { formatDate } from "../utils/date";
import styles from "./Beacons.module.css";

export default function Beacons() {
  const { data, status, errorMessage } = useFetch(() => fetchBeacons());

  const beacons: Beacon[] = data?.data ?? [];

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>비콘 관리</h1>
        <button className={styles.addButton}>+ 비콘 등록</button>
      </div>

      {status === "loading" && <div className={styles.message}>로딩 중...</div>}

      {status === "error" && (
        <div className={styles.message}>데이터를 불러오지 못했습니다: {errorMessage}</div>
      )}

      {status === "success" && beacons.length === 0 && (
        <div className={styles.message}>등록된 비콘이 없습니다.</div>
      )}

      {status === "success" && beacons.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>비콘 라벨</th>
                <th>MAC 주소</th>
                <th>할당 직원</th>
                <th>등록일</th>
                <th>상태</th>
                <th className={styles.actionCol}>작업</th>
              </tr>
            </thead>
            <tbody>
              {beacons.map((beacon) => (
                <BeaconRow key={beacon.id} beacon={beacon} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BeaconRow({ beacon }: { beacon: Beacon }) {
  return (
    <tr>
      <td>{beacon.label}</td>
      <td className={styles.mac}>{beacon.macAddress}</td>
      <td>{beacon.employeeName ?? "-"}</td>
      <td>{formatDate(beacon.registeredAt)}</td>
      <td>
        {beacon.isActive ? (
          <span className={styles.badgeActive}>활성</span>
        ) : (
          <span className={styles.badgeInactive}>비활성</span>
        )}
      </td>
      <td>
        <button className={styles.deleteBtn} disabled={!beacon.isActive}>
          비활성화
        </button>
      </td>
    </tr>
  );
}
