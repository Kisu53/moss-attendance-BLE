import { useEffect, useState } from "react";
import type { Employee, EmployeeListResponse } from "../types/api";
import styles from "./Employees.module.css";

type Status = "loading" | "success" | "error";
type ActiveFilter = "all" | "active" | "inactive";

export default function Employees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [status, setStatus] = useState<Status>("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");

    useEffect(() => {
        let cancelled = false;

        const fetchEmployees = async () => {
            setStatus("loading");
            try {
                let url = "/api/v1/employees";
                if (activeFilter === "active") url += "?is_active=true";
                else if (activeFilter === "inactive") url += "?is_active=false";

                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`서버 응답 오류: ${res.status}`);
                }
                const json: EmployeeListResponse = await res.json();
                if (!cancelled) {
                    setEmployees(json.data);
                    setStatus("success");
                }
            } catch (err) {
                if (!cancelled) {
                    setErrorMessage(err instanceof Error ? err.message : "알 수 없는 오류");
                    setStatus("error");
                }
            }
        };

        fetchEmployees();

        return () => {
            cancelled = true;
        };
    }, [activeFilter]);

    const filterButtons: { value: ActiveFilter; label: string }[] = [
        { value: "active", label: "재직중" },
        { value: "inactive", label: "비활성" },
        { value: "all", label: "전체" },
    ];

    return (
        <div>
            <h1 className={styles.title}>직원 관리</h1>

            <div className={styles.toolbar}>
                <div className={styles.filterGroup}>
                    {filterButtons.map((btn) => (
                        <button
                            key={btn.value}
                            className={`${styles.filterBtn} ${
                                activeFilter === btn.value ? styles.filterBtnActive : ""
                            }`}
                            onClick={() => setActiveFilter(btn.value)}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
                <div className={styles.count}>
                    {status === "success" && `총 ${employees.length}명`}
                </div>
            </div>

            {status === "loading" && <div className={styles.message}>로딩 중...</div>}

            {status === "error" && (
                <div className={styles.message}>
                    <p>데이터를 불러오지 못했습니다.</p>
                    <p className={styles.errorDetail}>{errorMessage}</p>
                </div>
            )}

            {status === "success" && employees.length === 0 && (
                <div className={styles.message}>해당 조건의 직원이 없습니다.</div>
            )}

            {status === "success" && employees.length > 0 && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>이름</th>
                                <th>부서</th>
                                <th>직책</th>
                                <th>이메일</th>
                                <th>상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id}>
                                    <td>{emp.name}</td>
                                    <td>{emp.department}</td>
                                    <td>{emp.position}</td>
                                    <td>{emp.email ?? "-"}</td>
                                    <td>
                                        {emp.isActive ? (
                                            <span className={styles.badgeActive}>재직중</span>
                                        ) : (
                                            <span className={styles.badgeInactive}>비활성</span>
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
