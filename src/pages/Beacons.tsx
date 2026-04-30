import { useState } from "react";
import { useFetch } from "../utils/useFetch";
import { fetchBeacons, deactivateBeacon } from "../api/beacons";
import type { Beacon } from "../types/api";
import { formatDate } from "../utils/date";
import Modal from "../components/Modal";
import BeaconForm from "../components/BeaconForm";
import ConfirmDialog from "../components/ConfirmDialog";
import styles from "./Beacons.module.scss";

export default function Beacons() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [beaconToDeactivate, setBeaconToDeactivate] = useState<Beacon | null>(null);

  const { data, status, errorMessage } = useFetch(() => fetchBeacons(), [refreshKey]);

  const beacons: Beacon[] = data?.data ?? [];

  const handleRegisterSuccess = () => {
    setIsModalOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDeactivateConfirm = async () => {
    if (!beaconToDeactivate) return;
    await deactivateBeacon(beaconToDeactivate.id);
    setBeaconToDeactivate(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>비콘 관리</h1>
          <p className={styles.subtitle}>비콘 등록 현황과 직원 할당 상태를 관리합니다.</p>
        </div>
        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
          + 비콘 등록
        </button>
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
                <BeaconRow
                  key={beacon.id}
                  beacon={beacon}
                  onDeactivateClick={setBeaconToDeactivate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="비콘 등록">
        <BeaconForm onSuccess={handleRegisterSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={beaconToDeactivate !== null}
        title="비콘 비활성화"
        message={
          beaconToDeactivate
            ? `'${beaconToDeactivate.label}' 비콘을 비활성화하시겠습니까? ${
                beaconToDeactivate.employeeName ?? "할당된 직원"
              }의 출퇴근이 더 이상 자동 기록되지 않습니다.`
            : ""
        }
        confirmLabel="비활성화"
        variant="danger"
        onConfirm={handleDeactivateConfirm}
        onClose={() => setBeaconToDeactivate(null)}
      />
    </div>
  );
}

interface BeaconRowProps {
  beacon: Beacon;
  onDeactivateClick: (beacon: Beacon) => void;
}

function BeaconRow({ beacon, onDeactivateClick }: BeaconRowProps) {
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
        <button
          className={styles.deleteBtn}
          disabled={!beacon.isActive}
          onClick={() => onDeactivateClick(beacon)}
        >
          비활성화
        </button>
      </td>
    </tr>
  );
}
