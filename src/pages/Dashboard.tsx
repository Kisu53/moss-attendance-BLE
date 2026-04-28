import { useEffect, useState } from "react";
import StatusCard from "../components/StatusCard";
import type { AttendanceTodayResponse } from "../types/api";
import styles from "./Dashboard.module.css";

//Data fetching 상태 3가지 명시
type Status = "loading" | "success" | "error";
export default function Dashboard() {
    // data, status, error 3가지의 별도 state로 분리, 추후 useReducer로 합치는 리팩토링 가능
    const [data, setData] = useState<AttendanceTodayResponse | null>(null);
    const [status, setStatus] = useState<Status>("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");

    /*컴포넌트가 화면에 뜨면 API를 호출하고, 성공/실패 상태를 관리하되, 컴포넌트가 사라진 후에는 state를 바꾸지 않도록 */
    useEffect(() => {
        let cancelled = false;

        //api 요청을 보내는 비동기 함수
        const fetchData = async () => {
            try {
                const res = await fetch("/api/v1/attendance/today");
                if (!res.ok) {
                    throw new Error(`Serever Response Error: ${res.status}`);
                }
                const json: AttendanceTodayResponse = await res.json();
                if (!cancelled) {
                    setData(json);
                    setStatus("success");
                }
            } catch (err) {
                if (!cancelled) {
                    setErrorMessage(err instanceof Error ? err.message : "Unknown Error");
                    setStatus("error");
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, []);

    if (status === "loading") {
        return <div className={styles.message}>Loading...</div>;
    }

    if (status === "error") {
        return (
            <div className={styles.message}>
                <p>Failed to fetch data.</p>
                <p className={styles.errorDetail}>{errorMessage}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div>
            <h1 className={styles.title}>대시보드</h1>
            <p className={styles.subtitle}>{data.date} 기준 오늘의 출근 현황</p>

            <div className={styles.cardGrid}>
                <StatusCard label="전체 직원" value={data.total} variant="default" />
                <StatusCard label="출근" value={data.checkedIn} variant="primary" />
                <StatusCard label="미출근" value={data.notCheckedIn} variant="warning" />
                <StatusCard label="퇴근" value={data.checkedOut} variant="muted" />
            </div>
        </div>
    );
}
