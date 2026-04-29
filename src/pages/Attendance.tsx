import { useState } from "react";
import { useFetch } from "../utils/useFetch";
import { fetchAttendanceList } from "../api/attendance";
import type { AttendanceLog } from "../types/api";
import { formatTime, getTodayString } from "../utils/date";
import styles from "./Attendance.module.css";

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  const { data, status, errorMessage } = useFetch(
    () => fetchAttendanceList(selectedDate),
    [selectedDate]
  );

  const logs: AttendanceLog[] = data?.data ?? [];

  return (
    <div>
      <h1 className={styles.title}>출퇴근 기록</h1>

      <div className={styles.toolbar}>
        <label className={styles.filterLabel}>
          날짜
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.dateInput}
          />
        </label>
      </div>

      {status === "loading" && <div className={styles.message}>로딩 중...</div>}

      {status === "error" && (
        <div className={styles.message}>
          <p>데이터를 불러오지 못했습니다.</p>
          <p className={styles.errorDetail}>{errorMessage}</p>
        </div>
      )}

      {status === "success" && logs.length === 0 && (
        <div className={styles.message}>해당 날짜의 기록이 없습니다.</div>
      )}

      {status === "success" && logs.length > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>이름</th>
                <th>비콘</th>
                <th>출근 시간</th>
                <th>퇴근 시간</th>
                <th>퇴근 방식</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.employeeName}</td>
                  <td>{log.beaconLabel}</td>
                  <td>{formatTime(log.checkIn)}</td>
                  <td>{formatTime(log.checkOut)}</td>
                  <td>
                    {log.checkOut === null ? (
                      <span className={styles.statusActive}>근무중</span>
                    ) : log.autoCheckout ? (
                      "자동"
                    ) : (
                      "수동"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
