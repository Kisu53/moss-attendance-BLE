import { useMemo, useState, type FormEvent } from "react";
import { useFetch } from "../utils/useFetch";
import { fetchAttendanceList } from "../api/attendance";
import { fetchEmployees } from "../api/employees";
import type { AttendanceLog, Employee } from "../types/api";
import { formatTime, getTodayString } from "../utils/date";
import styles from "./Attendance.module.scss";

type AttendanceFilters = {
  from: string;
  to: string;
  employeeName: string;
  department: string;
};

function createDefaultFilters(): AttendanceFilters {
  const today = getTodayString();
  return {
    from: today,
    to: today,
    employeeName: "",
    department: "",
  };
}

export default function Attendance() {
  const [draftFilters, setDraftFilters] = useState<AttendanceFilters>(() => createDefaultFilters());
  const [appliedFilters, setAppliedFilters] = useState<AttendanceFilters>(() =>
    createDefaultFilters()
  );

  const { data, status, errorMessage } = useFetch(
    () =>
      fetchAttendanceList({
        from: appliedFilters.from,
        to: appliedFilters.to,
        employee_name: appliedFilters.employeeName || undefined,
        department: appliedFilters.department || undefined,
      }),
    [appliedFilters]
  );
  const { data: employeesData } = useFetch(() => fetchEmployees());

  const logs: AttendanceLog[] = data?.data ?? [];
  const employees: Employee[] = useMemo(() => employeesData?.data ?? [], [employeesData]);
  const employeesById = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees]
  );
  const departments = useMemo(
    () =>
      Array.from(new Set(employees.map((employee) => employee.department)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "ko")),
    [employees]
  );
  const hasDateRangeError =
    draftFilters.from !== "" && draftFilters.to !== "" && draftFilters.from > draftFilters.to;

  const updateDraftFilter = (name: keyof AttendanceFilters, value: string) => {
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasDateRangeError) return;

    setAppliedFilters({
      ...draftFilters,
      employeeName: draftFilters.employeeName.trim(),
    });
  };

  const handleReset = () => {
    const nextFilters = createDefaultFilters();
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>출퇴근 기록</h1>
          <p className={styles.subtitle}>직원별 출근, 퇴근, 자동 처리 상태를 확인합니다.</p>
        </div>
      </div>

      <form className={styles.filterPanel} onSubmit={handleSearch}>
        <div className={styles.filterGrid}>
          <label className={styles.filterField}>
            시작일
            <input
              type="date"
              value={draftFilters.from}
              onChange={(e) => updateDraftFilter("from", e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.filterField}>
            종료일
            <input
              type="date"
              value={draftFilters.to}
              onChange={(e) => updateDraftFilter("to", e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.filterField}>
            직원명
            <input
              type="search"
              value={draftFilters.employeeName}
              onChange={(e) => updateDraftFilter("employeeName", e.target.value)}
              placeholder="이름 입력"
              className={styles.input}
            />
          </label>
          <label className={styles.filterField}>
            부서
            <select
              value={draftFilters.department}
              onChange={(e) => updateDraftFilter("department", e.target.value)}
              className={styles.select}
            >
              <option value="">전체 부서</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.filterActions}>
          {hasDateRangeError && (
            <p className={styles.validationText}>종료일은 시작일보다 빠를 수 없습니다.</p>
          )}
          <button type="button" className={styles.secondaryButton} onClick={handleReset}>
            초기화
          </button>
          <button type="submit" className={styles.primaryButton} disabled={hasDateRangeError}>
            검색
          </button>
        </div>
      </form>

      {status === "loading" && <div className={styles.message}>로딩 중...</div>}

      {status === "error" && (
        <div className={styles.message}>
          <p>데이터를 불러오지 못했습니다.</p>
          <p className={styles.errorDetail}>{errorMessage}</p>
        </div>
      )}

      {status === "success" && logs.length === 0 && (
        <div className={styles.message}>조건에 맞는 출퇴근 기록이 없습니다.</div>
      )}

      {status === "success" && logs.length > 0 && (
        <div className={styles.tableWrapper}>
          <div className={styles.resultMeta}>검색 결과 {logs.length}건</div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>이름</th>
                <th>부서</th>
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
                  <td>{employeesById.get(log.employeeId)?.department ?? "-"}</td>
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
