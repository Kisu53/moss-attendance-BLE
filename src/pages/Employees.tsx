import { useState } from "react";
import { useFetch } from "../utils/useFetch";
import { fetchEmployees } from "../api/employees";
import type { Employee } from "../types/api";
import styles from "./Employees.module.scss";

type ActiveFilter = "all" | "active" | "inactive";

export default function Employees() {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");

  const { data, status, errorMessage } = useFetch(() => {
    const isActive =
      activeFilter === "active" ? "true" : activeFilter === "inactive" ? "false" : undefined;
    return fetchEmployees(isActive);
  }, [activeFilter]);

  const employees: Employee[] = data?.data ?? [];

  const filterButtons: { value: ActiveFilter; label: string }[] = [
    { value: "active", label: "재직중" },
    { value: "inactive", label: "비활성" },
    { value: "all", label: "전체" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>직원 관리</h1>
          <p className={styles.subtitle}>직원 정보와 근무 상태를 관리합니다.</p>
        </div>
        <div className={styles.count}>{status === "success" && `총 ${employees.length}명`}</div>
      </div>

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
