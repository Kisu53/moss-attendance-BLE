import { useEffect, useState } from "react";
import type { AttendanceLog, AttendanceListResponse } from "../types/api";
import { formatTime, getTodayString } from "../utils/date";
import styles from "./Attendance.module.css";

type Status = "loading" | "success" | "error";

export default function Attendance() {
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [status, setStatus] = useState<Status>("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

    useEffect(() => {
        let cancelled = false;

        const fetchLogs = async () => {
            setStatus("loading");
            try {
                const res = await fetch(`/api/v1/attendance?date=${selectedDate}`);
                if (!res.ok) {
                    throw new Error(`서버 응답 오류: ${res.status}`);
                }
                const json: AttendanceListResponse = await res.json();
                if (!cancelled) {
                    setLogs(json.data);
                    setStatus("success");
                }
            } catch (err) {
                if (!cancelled) {
                    setErrorMessage(err instanceof Error ? err.message : "알 수 없는 오류");
                    setStatus("error");
                }
            }
        };

        fetchLogs();

        return () => {
            cancelled = true;
        };
    }, [selectedDate]);

    return (
        <div>
            <h1 className={styles.title}>출퇴근 기록</h1>

            <div className={styles.toolbar}>
                <label className={styles.filterLabel}>
                    날짜
                    <input
                        type="date"
                        value={selectedDate}
                        // 사용자가 날짜를 바꿀 때 state 업데이트
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
