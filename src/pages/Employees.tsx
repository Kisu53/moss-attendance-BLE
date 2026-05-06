import { useMemo, useState } from "react";
import { useFetch } from "../utils/useFetch";
import { activateEmployee, deactivateEmployee, fetchEmployees } from "../api/employees";
import { fetchBeacons } from "../api/beacons";
import type { Beacon, Employee } from "../types/api";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeDetail from "../components/EmployeeDetail";
import styles from "./Employees.module.scss";

type ActiveFilter = "all" | "active" | "inactive";
type FormMode = "create" | "edit";

function getInitials(name: string) {
  return name.slice(0, 2);
}

export default function Employees() {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailEmployeeId, setDetailEmployeeId] = useState<number | null>(null);
  const [employeeToDeactivate, setEmployeeToDeactivate] = useState<Employee | null>(null);
  const [employeeToActivate, setEmployeeToActivate] = useState<Employee | null>(null);

  const { data, status, errorMessage } = useFetch(() => {
    const isActive =
      activeFilter === "active" ? "true" : activeFilter === "inactive" ? "false" : undefined;
    return fetchEmployees(isActive);
  }, [activeFilter, refreshKey]);
  const { data: beaconsData } = useFetch(() => fetchBeacons(), [refreshKey]);

  const employees: Employee[] = useMemo(() => data?.data ?? [], [data]);
  const beacons: Beacon[] = useMemo(() => beaconsData?.data ?? [], [beaconsData]);
  const beaconsByEmployeeId = useMemo(
    () =>
      new Map(
        beacons
          .filter((beacon) => beacon.isActive && beacon.employeeId !== null)
          .map((beacon) => [beacon.employeeId, beacon])
      ),
    [beacons]
  );
  const departments = useMemo(
    () =>
      Array.from(new Set(employees.map((employee) => employee.department)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "ko")),
    [employees]
  );
  const filteredEmployees = useMemo(() => {
    const trimmedSearch = searchTerm.trim();
    return employees.filter((employee) => {
      const matchesSearch =
        trimmedSearch === "" ||
        employee.name.includes(trimmedSearch) ||
        employee.email?.includes(trimmedSearch);
      const matchesDepartment =
        selectedDepartment === "" || employee.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [employees, searchTerm, selectedDepartment]);

  const filterButtons: { value: ActiveFilter; label: string }[] = [
    { value: "active", label: "재직중" },
    { value: "inactive", label: "비활성" },
    { value: "all", label: "전체" },
  ];

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setFormMode("create");
  };

  const handleOpenEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormMode("edit");
  };

  const handleCloseForm = () => {
    setSelectedEmployee(null);
    setFormMode(null);
  };

  const handleMutationSuccess = () => {
    setSelectedEmployee(null);
    setFormMode(null);
    setEmployeeToDeactivate(null);
    setEmployeeToActivate(null);
    setRefreshKey((key) => key + 1);
  };

  const handleDeactivateConfirm = async () => {
    if (!employeeToDeactivate) return;

    await deactivateEmployee(employeeToDeactivate.id);
    handleMutationSuccess();
  };

  const handleActivateConfirm = async () => {
    if (!employeeToActivate) return;

    await activateEmployee(employeeToActivate.id);
    handleMutationSuccess();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>직원 관리</h1>
          <p className={styles.subtitle}>직원 정보와 근무 상태를 관리합니다.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.count}>
            {status === "success" && `총 ${filteredEmployees.length}명`}
          </div>
          <button className={styles.addButton} onClick={handleOpenCreate}>
            + 직원 등록
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchGroup}>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={styles.searchInput}
            placeholder="직원명 또는 이메일 검색"
          />
          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className={styles.departmentSelect}
          >
            <option value="">전체 부서</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
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

      {status === "success" && filteredEmployees.length === 0 && (
        <div className={styles.message}>해당 조건의 직원이 없습니다.</div>
      )}

      {status === "success" && filteredEmployees.length > 0 && (
        <div className={styles.cardGrid}>
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              beacon={beaconsByEmployeeId.get(employee.id)}
              onDetailClick={() => setDetailEmployeeId(employee.id)}
              onEditClick={() => handleOpenEdit(employee)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={formMode !== null}
        onClose={handleCloseForm}
        title={formMode === "edit" ? "직원 정보 수정" : "직원 등록"}
      >
        <EmployeeForm
          mode={formMode ?? "create"}
          employee={selectedEmployee}
          onCancel={handleCloseForm}
          onSuccess={handleMutationSuccess}
          onDeactivateClick={() => selectedEmployee && setEmployeeToDeactivate(selectedEmployee)}
          onActivateClick={() => selectedEmployee && setEmployeeToActivate(selectedEmployee)}
        />
      </Modal>

      <Modal
        isOpen={detailEmployeeId !== null}
        onClose={() => setDetailEmployeeId(null)}
        title="직원 상세"
        size="wide"
      >
        {detailEmployeeId !== null && (
          <EmployeeDetail
            employeeId={detailEmployeeId}
            onChanged={() => setRefreshKey((key) => key + 1)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={employeeToDeactivate !== null}
        title="직원 비활성화"
        message={
          employeeToDeactivate
            ? `${employeeToDeactivate.name} 직원을 비활성화하시겠습니까? 비활성화된 직원은 출퇴근 자동 기록 대상에서 제외되고 할당된 비콘은 해제됩니다.`
            : ""
        }
        confirmLabel="비활성화"
        variant="danger"
        onConfirm={handleDeactivateConfirm}
        onClose={() => setEmployeeToDeactivate(null)}
      />

      <ConfirmDialog
        isOpen={employeeToActivate !== null}
        title="직원 활성화"
        message={
          employeeToActivate
            ? `${employeeToActivate.name} 직원을 다시 활성화하시겠습니까? 활성화 후 직원 목록과 비콘 할당 대상에 다시 포함됩니다.`
            : ""
        }
        confirmLabel="활성화"
        variant="primary"
        onConfirm={handleActivateConfirm}
        onClose={() => setEmployeeToActivate(null)}
      />
    </div>
  );
}

interface EmployeeCardProps {
  employee: Employee;
  beacon?: Beacon;
  onDetailClick: () => void;
  onEditClick: () => void;
}

function EmployeeCard({ employee, beacon, onDetailClick, onEditClick }: EmployeeCardProps) {
  return (
    <article className={`${styles.employeeCard} ${!employee.isActive ? styles.inactiveCard : ""}`}>
      <div className={styles.cardTop}>
        <div className={styles.avatar}>{getInitials(employee.name)}</div>
        <div className={styles.cardIdentity}>
          <div className={styles.nameRow}>
            <h2>{employee.name}</h2>
            {employee.isActive ? (
              <span className={styles.badgeActive}>재직중</span>
            ) : (
              <span className={styles.badgeInactive}>비활성</span>
            )}
          </div>
          <p>
            {employee.department} / {employee.position}
          </p>
        </div>
      </div>

      <div className={styles.cardMeta}>
        <div>
          <span>이메일</span>
          <strong>{employee.email ?? "-"}</strong>
        </div>
        <div>
          <span>비콘</span>
          <strong>{beacon ? `${beacon.label} / ${beacon.macAddress}` : "미할당"}</strong>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.secondaryButton} onClick={onDetailClick}>
          상세
        </button>
        <button className={styles.secondaryButton} onClick={onEditClick}>
          수정
        </button>
      </div>
    </article>
  );
}
