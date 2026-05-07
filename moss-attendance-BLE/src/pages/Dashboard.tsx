import { useFetch } from "../utils/useFetch";
import StatusCard from "../components/dashboard/StatusCard";
import RealTimeFeed from "../components/dashboard/RealTimeFeed";
import DeviceStatusCard from "../components/dashboard/DeviceStatusCard";
import { fetchAttendanceToday } from "../api/attendance";
import { fetchEmployees } from "../api/employees";
import type { Employee } from "../types/api";
import styles from "./Dashboard.module.scss";

type EmployeeTone = "present" | "absent" | "left";

const employeeStatusPresets: { tone: EmployeeTone; label: string; time: string }[] = [
  { tone: "present", label: "출근", time: "09:23" },
  { tone: "present", label: "출근", time: "09:05" },
  { tone: "present", label: "출근", time: "09:41" },
  { tone: "present", label: "출근", time: "08:58" },
  { tone: "left", label: "퇴근", time: "09:30" },
  { tone: "absent", label: "미출근", time: "-" },
  { tone: "present", label: "출근", time: "10:02" },
  { tone: "present", label: "출근", time: "09:17" },
  { tone: "absent", label: "미출근", time: "-" },
  { tone: "left", label: "퇴근", time: "09:00" },
];

export default function Dashboard() {
  const { data, status, errorMessage } = useFetch(() => fetchAttendanceToday());
  const { data: employeesData, status: employeesStatus } = useFetch(() => fetchEmployees("true"));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>메인 대시보드</h1>
          <p className={styles.subtitle}>
            {data ? `${data.date} 기준 출근 현황` : "오늘의 출근 현황"}
          </p>
        </div>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          LIVE
        </div>
      </div>

      <section className={styles.summaryGrid}>
        {status === "loading" && <div className={styles.message}>로딩 중...</div>}
        {status === "error" && <div className={styles.message}>오류: {errorMessage}</div>}
        {status === "success" && data && (
          <>
            <StatusCard label="출근" value={data.checkedIn} total={data.total} variant="primary" />
            <StatusCard
              label="미출근"
              value={data.notCheckedIn}
              total={data.total}
              variant="warning"
            />
            <StatusCard label="퇴근" value={data.checkedOut} total={data.total} variant="muted" />
            <DeviceStatusCard />
          </>
        )}
      </section>

      <div className={styles.contentGrid}>
        <RealTimeFeed />
        <EmployeeOverview
          employees={employeesData?.data ?? []}
          loading={employeesStatus === "loading"}
        />
      </div>
    </div>
  );
}

function EmployeeOverview({ employees, loading }: { employees: Employee[]; loading: boolean }) {
  const visibleEmployees = employees.slice(0, 10);

  return (
    <section className={styles.employeePanel}>
      <h2 className={styles.panelTitle}>전체 직원 현황</h2>
      {loading && <div className={styles.message}>로딩 중...</div>}
      {!loading && (
        <div className={styles.employeeGrid}>
          {visibleEmployees.map((employee, index) => {
            const preset = employeeStatusPresets[index % employeeStatusPresets.length];
            return (
              <EmployeeTile
                key={employee.id}
                employee={employee}
                tone={preset.tone}
                status={preset.label}
                time={preset.time}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function EmployeeTile({
  employee,
  tone,
  status,
  time,
}: {
  employee: Employee;
  tone: EmployeeTone;
  status: string;
  time: string;
}) {
  return (
    <div className={`${styles.employeeTile} ${styles[tone]}`}>
      <div className={styles.employeeMain}>
        <span className={styles.statusDot} />
        <div>
          <strong>{employee.name}</strong>
          <span>
            {employee.department} · {status}
          </span>
        </div>
      </div>
      <time>{time}</time>
    </div>
  );
}
