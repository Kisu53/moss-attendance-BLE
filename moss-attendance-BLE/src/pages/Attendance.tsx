import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AxiosError } from "axios";
import { useFetch } from "../utils/useFetch";
import {
  createManualAttendance,
  fetchAttendanceList,
  updateAttendanceLog,
} from "../api/attendance";
import { fetchEmployees } from "../api/employees";
import type {
  AttendanceLog,
  Employee,
  ManualAttendanceRequest,
  UpdateAttendanceRequest,
} from "../types/api";
import { formatTime, getTodayString } from "../utils/date";
import Modal from "../components/common/Modal";
import styles from "./Attendance.module.scss";

type AttendanceFilters = {
  from: string;
  to: string;
  employeeName: string;
  department: string;
};

type FormErrors = Record<string, string>;

function createDefaultFilters(): AttendanceFilters {
  const today = getTodayString();
  return {
    from: today,
    to: today,
    employeeName: "",
    department: "",
  };
}

function toTimeInputValue(isoString: string | null): string {
  return isoString ? isoString.slice(11, 16) : "";
}

function toDateTimeValue(date: string, time: string): string {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${normalizedTime}+09:00`;
}

function extractSubmitError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.error ?? fallback;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return fallback;
}

export default function Attendance() {
  const [draftFilters, setDraftFilters] = useState<AttendanceFilters>(() => createDefaultFilters());
  const [appliedFilters, setAppliedFilters] = useState<AttendanceFilters>(() =>
    createDefaultFilters()
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingLog, setEditingLog] = useState<AttendanceLog | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const { data, status, errorMessage } = useFetch(
    () =>
      fetchAttendanceList({
        from: appliedFilters.from,
        to: appliedFilters.to,
        employee_name: appliedFilters.employeeName || undefined,
        department: appliedFilters.department || undefined,
      }),
    [appliedFilters, refreshKey]
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

  const handleMutationSuccess = () => {
    setEditingLog(null);
    setIsManualModalOpen(false);
    setRefreshKey((key) => key + 1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>출퇴근 기록</h1>
          <p className={styles.subtitle}>직원별 출근, 퇴근, 자동 처리 상태를 확인합니다.</p>
        </div>
        <button className={styles.headerButton} onClick={() => setIsManualModalOpen(true)}>
          + 수동 등록
        </button>
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
                <th>일자</th>
                <th>이름</th>
                <th>부서</th>
                <th>비콘</th>
                <th>출근 시간</th>
                <th>퇴근 시간</th>
                <th>퇴근 방식</th>
                <th>메모</th>
                <th className={styles.actionCol}>관리</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td>{log.employeeName}</td>
                  <td>{employeesById.get(log.employeeId)?.department ?? "-"}</td>
                  <td>{log.beaconLabel}</td>
                  <td>{formatTime(log.checkIn)}</td>
                  <td>{formatTime(log.checkOut)}</td>
                  <td>{renderCheckoutStatus(log)}</td>
                  <td className={styles.memoCell}>{log.memo || "-"}</td>
                  <td>
                    <button className={styles.rowActionButton} onClick={() => setEditingLog(log)}>
                      보정
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={editingLog !== null}
        onClose={() => setEditingLog(null)}
        title="출퇴근 기록 보정"
      >
        {editingLog && (
          <AttendanceAdjustForm
            log={editingLog}
            department={employeesById.get(editingLog.employeeId)?.department ?? "-"}
            onCancel={() => setEditingLog(null)}
            onSuccess={handleMutationSuccess}
          />
        )}
      </Modal>

      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="수동 출퇴근 등록"
      >
        <ManualAttendanceForm
          employees={employees}
          onCancel={() => setIsManualModalOpen(false)}
          onSuccess={handleMutationSuccess}
        />
      </Modal>
    </div>
  );
}

function renderCheckoutStatus(log: AttendanceLog) {
  if (log.checkOut === null) {
    return <span className={styles.statusActive}>근무중</span>;
  }

  if (log.manualRegistered) {
    return <span className={styles.statusManual}>수동 등록</span>;
  }

  if (log.manualAdjusted) {
    return <span className={styles.statusAdjusted}>수동 보정</span>;
  }

  return log.autoCheckout ? "자동" : "수동";
}

interface AttendanceAdjustFormProps {
  log: AttendanceLog;
  department: string;
  onCancel: () => void;
  onSuccess: () => void;
}

function AttendanceAdjustForm({ log, department, onCancel, onSuccess }: AttendanceAdjustFormProps) {
  const [date, setDate] = useState(log.date);
  const [checkInTime, setCheckInTime] = useState(toTimeInputValue(log.checkIn));
  const [checkOutTime, setCheckOutTime] = useState(toTimeInputValue(log.checkOut));
  const [memo, setMemo] = useState(log.memo ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!date) nextErrors.date = "날짜를 선택하세요";
    if (!checkInTime) nextErrors.checkInTime = "출근 시간을 입력하세요";
    if (checkOutTime && checkInTime && checkOutTime <= checkInTime) {
      nextErrors.checkOutTime = "퇴근 시간은 출근 시간 이후여야 합니다";
    }
    if (!memo.trim()) nextErrors.memo = "보정 사유를 입력하세요";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    const payload: UpdateAttendanceRequest = {
      check_in: toDateTimeValue(date, checkInTime),
      check_out: checkOutTime ? toDateTimeValue(date, checkOutTime) : null,
      memo: memo.trim(),
    };

    setSubmitting(true);
    try {
      await updateAttendanceLog(log.id, payload);
      onSuccess();
    } catch (err) {
      setSubmitError(extractSubmitError(err, "출퇴근 기록 보정에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.modalForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.readonlyBox}>
        <span>{log.employeeName}</span>
        <strong>{department}</strong>
      </div>

      <div className={styles.formGrid}>
        <FormField label="날짜" error={errors.date}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${styles.input} ${errors.date ? styles.inputError : ""}`}
            disabled={submitting}
          />
        </FormField>
        <FormField label="출근 시간" error={errors.checkInTime}>
          <input
            type="time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className={`${styles.input} ${errors.checkInTime ? styles.inputError : ""}`}
            disabled={submitting}
          />
        </FormField>
        <FormField label="퇴근 시간" error={errors.checkOutTime}>
          <input
            type="time"
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            className={`${styles.input} ${errors.checkOutTime ? styles.inputError : ""}`}
            disabled={submitting}
          />
        </FormField>
      </div>

      <FormField label="보정 메모" error={errors.memo}>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 비콘 감지 누락으로 관리자 보정"
          className={`${styles.textarea} ${errors.memo ? styles.inputError : ""}`}
          disabled={submitting}
          maxLength={200}
        />
      </FormField>

      {submitError && <div className={styles.submitError}>{submitError}</div>}

      <div className={styles.modalActions}>
        <button type="button" className={styles.secondaryButton} onClick={onCancel}>
          취소
        </button>
        <button type="submit" className={styles.primaryButton} disabled={submitting}>
          {submitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}

interface ManualAttendanceFormProps {
  employees: Employee[];
  onCancel: () => void;
  onSuccess: () => void;
}

function ManualAttendanceForm({ employees, onCancel, onSuccess }: ManualAttendanceFormProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!employeeId) nextErrors.employeeId = "직원을 선택하세요";
    if (!date) nextErrors.date = "날짜를 선택하세요";
    if (!checkInTime) nextErrors.checkInTime = "출근 시간을 입력하세요";
    if (checkOutTime && checkInTime && checkOutTime <= checkInTime) {
      nextErrors.checkOutTime = "퇴근 시간은 출근 시간 이후여야 합니다";
    }
    if (!memo.trim()) nextErrors.memo = "수동 등록 사유를 입력하세요";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    const payload: ManualAttendanceRequest = {
      employee_id: Number(employeeId),
      date,
      check_in: toDateTimeValue(date, checkInTime),
      check_out: checkOutTime ? toDateTimeValue(date, checkOutTime) : null,
      memo: memo.trim(),
    };

    setSubmitting(true);
    try {
      await createManualAttendance(payload);
      onSuccess();
    } catch (err) {
      setSubmitError(extractSubmitError(err, "수동 출퇴근 등록에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.modalForm} onSubmit={handleSubmit} noValidate>
      <FormField label="직원" error={errors.employeeId}>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className={`${styles.select} ${errors.employeeId ? styles.inputError : ""}`}
          disabled={submitting || employees.length === 0}
        >
          <option value="">직원을 선택하세요</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} ({employee.department})
            </option>
          ))}
        </select>
      </FormField>

      <div className={styles.formGrid}>
        <FormField label="날짜" error={errors.date}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`${styles.input} ${errors.date ? styles.inputError : ""}`}
            disabled={submitting}
          />
        </FormField>
        <FormField label="출근 시간" error={errors.checkInTime}>
          <input
            type="time"
            value={checkInTime}
            onChange={(e) => setCheckInTime(e.target.value)}
            className={`${styles.input} ${errors.checkInTime ? styles.inputError : ""}`}
            disabled={submitting}
          />
        </FormField>
        <FormField label="퇴근 시간" error={errors.checkOutTime}>
          <input
            type="time"
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            className={`${styles.input} ${errors.checkOutTime ? styles.inputError : ""}`}
            disabled={submitting}
          />
        </FormField>
      </div>

      <FormField label="등록 메모" error={errors.memo}>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 비콘 분실로 관리자 수동 등록"
          className={`${styles.textarea} ${errors.memo ? styles.inputError : ""}`}
          disabled={submitting}
          maxLength={200}
        />
      </FormField>

      {submitError && <div className={styles.submitError}>{submitError}</div>}

      <div className={styles.modalActions}>
        <button type="button" className={styles.secondaryButton} onClick={onCancel}>
          취소
        </button>
        <button type="submit" className={styles.primaryButton} disabled={submitting}>
          {submitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className={styles.formField}>
      <span>{label}</span>
      {children}
      {error && <em className={styles.fieldError}>{error}</em>}
    </label>
  );
}
