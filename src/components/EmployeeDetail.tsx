import { useState } from "react";
import { AxiosError } from "axios";
import {
  assignEmployeeBeacon,
  fetchEmployeeDetail,
  unassignEmployeeBeacon,
} from "../api/employees";
import { useFetch } from "../utils/useFetch";
import { formatTime } from "../utils/date";
import type { AttendanceLog } from "../types/api";
import styles from "./EmployeeDetail.module.scss";

interface EmployeeDetailProps {
  employeeId: number;
  onChanged: () => void;
}

function getInitials(name: string) {
  return name.slice(0, 2);
}

function formatWorkMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return restMinutes > 0 ? `${hours}h ${restMinutes}m` : `${hours}h`;
}

function getAttendanceType(log: AttendanceLog) {
  if (log.checkOut === null) return "근무중";
  if (log.manualRegistered) return "수동 등록";
  if (log.manualAdjusted) return "수동 보정";
  return log.autoCheckout ? "자동" : "수동";
}

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof AxiosError) {
    return err.response?.data?.error ?? fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
}

export default function EmployeeDetail({ employeeId, onChanged }: EmployeeDetailProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBeaconId, setSelectedBeaconId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { data, status, errorMessage } = useFetch(
    () => fetchEmployeeDetail(employeeId),
    [employeeId, refreshKey]
  );

  const handleAssign = async () => {
    if (!selectedBeaconId) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await assignEmployeeBeacon(employeeId, { beacon_id: Number(selectedBeaconId) });
      setSelectedBeaconId("");
      setRefreshKey((key) => key + 1);
      onChanged();
    } catch (err) {
      setSubmitError(getErrorMessage(err, "비콘 할당에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await unassignEmployeeBeacon(employeeId);
      setSelectedBeaconId("");
      setRefreshKey((key) => key + 1);
      onChanged();
    } catch (err) {
      setSubmitError(getErrorMessage(err, "비콘 해제에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <div className={styles.message}>직원 정보를 불러오는 중...</div>;
  }

  if (status === "error" || !data) {
    return <div className={styles.message}>직원 정보를 불러오지 못했습니다: {errorMessage}</div>;
  }

  const { employee, beacon, availableBeacons, summary, recentAttendance } = data;

  return (
    <div className={styles.detail}>
      <section className={styles.profile}>
        <div className={styles.avatar}>{getInitials(employee.name)}</div>
        <div className={styles.profileMain}>
          <h3>{employee.name}</h3>
          <p>
            {employee.department} / {employee.position} / {employee.email ?? "이메일 없음"}
          </p>
        </div>
        {employee.isActive ? (
          <span className={styles.badgeActive}>재직중</span>
        ) : (
          <span className={styles.badgeInactive}>비활성</span>
        )}
      </section>

      <section className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span>평균 출근</span>
          <strong>{summary.averageCheckIn ?? "-"}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>출근일수</span>
          <strong>{summary.workDays}일</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>지각</span>
          <strong>{summary.lateCount}회</strong>
        </div>
        <div className={styles.summaryCard}>
          <span>총 근무</span>
          <strong>{formatWorkMinutes(summary.totalWorkMinutes)}</strong>
        </div>
      </section>

      <section className={styles.section}>
        <h4>비콘 할당</h4>
        <div className={styles.beaconPanel}>
          <div className={styles.beaconInfo}>
            <strong>{beacon ? beacon.label : "할당된 비콘 없음"}</strong>
            <span>{beacon ? beacon.macAddress : "사용 가능한 비콘을 선택해 할당하세요."}</span>
          </div>
          <div className={styles.beaconActions}>
            <select
              className={styles.select}
              value={selectedBeaconId}
              onChange={(event) => setSelectedBeaconId(event.target.value)}
              disabled={submitting || availableBeacons.length === 0 || !employee.isActive}
            >
              <option value="">
                {availableBeacons.length === 0 ? "할당 가능한 비콘 없음" : "비콘 선택"}
              </option>
              {availableBeacons.map((availableBeacon) => (
                <option key={availableBeacon.id} value={availableBeacon.id}>
                  {availableBeacon.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleAssign}
              disabled={submitting || !selectedBeaconId || !employee.isActive}
            >
              할당 변경
            </button>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={handleUnassign}
              disabled={submitting || !beacon || !employee.isActive}
            >
              해제
            </button>
          </div>
        </div>
      </section>

      {submitError && <div className={styles.error}>{submitError}</div>}

      <section className={styles.section}>
        <h4>최근 출퇴근 이력</h4>
        {recentAttendance.length === 0 ? (
          <div className={styles.empty}>최근 출퇴근 이력이 없습니다.</div>
        ) : (
          <div className={styles.historyWrapper}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>일자</th>
                  <th>출근</th>
                  <th>퇴근</th>
                  <th>방식</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((log) => (
                  <tr key={log.id}>
                    <td>{log.date}</td>
                    <td>{formatTime(log.checkIn)}</td>
                    <td>{formatTime(log.checkOut)}</td>
                    <td>{getAttendanceType(log)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
