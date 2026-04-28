import { useEffect, useState } from "react";
import StatusCard from "../components/StatusCard";
import type { ApiResponse, TodayAttendanceResponse } from "../types/api";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
    const [data, setData] = useState<TodayAttendanceResponse | null>(null);

    useEffect(() => {
        fetch("/api/v1/attendance/today")
            .then((res) => res.json() as Promise<ApiResponse<TodayAttendanceResponse>>)
            .then((json) => {
                if (json.status === "ok" && json.data) {
                    setData(json.data);
                }
            });
    }, []);

    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1 className={styles.title}>대시보드</h1>
            <p className={styles.subtitle}>{data.date} 기준 오늘의 출근 현황</p>

            <div className={styles.cardGrid}>
                <StatusCard label="전체 직원" value={data.employees.length} variant="default" />
                <StatusCard label="출근" value={data.checked_in_count} variant="primary" />
                <StatusCard label="미출근" value={data.not_checked_in_count} variant="warning" />
                <StatusCard label="퇴근" value={data.checked_out_count} variant="muted" />
            </div>
        </div>
    );
}
