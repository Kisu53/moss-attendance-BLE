import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { createEmployee, updateEmployee } from "../api/employees";
import type { CreateEmployeeRequest, Employee } from "../types/api";
import styles from "./EmployeeForm.module.scss";

interface EmployeeFormProps {
  mode: "create" | "edit";
  employee?: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
  onActivateClick?: () => void;
  onDeactivateClick?: () => void;
}

type ValidationErrors = {
  name?: string;
  department?: string;
  position?: string;
  email?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmployeeForm({
  mode,
  employee,
  onSuccess,
  onCancel,
  onActivateClick,
  onDeactivateClick,
}: EmployeeFormProps) {
  const [name, setName] = useState(employee?.name ?? "");
  const [department, setDepartment] = useState(employee?.department ?? "");
  const [position, setPosition] = useState(employee?.position ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validate = () => {
    const errors: ValidationErrors = {};

    if (!name.trim()) errors.name = "이름을 입력하세요";
    if (!department.trim()) errors.department = "부서를 입력하세요";
    if (!position.trim()) errors.position = "직책을 입력하세요";
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) {
      errors.email = "올바른 이메일 형식이 아닙니다";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    const payload: CreateEmployeeRequest = {
      name: name.trim(),
      department: department.trim(),
      position: position.trim(),
      email: email.trim() || undefined,
    };

    setSubmitting(true);
    try {
      if (mode === "edit" && employee) {
        await updateEmployee(employee.id, payload);
      } else {
        await createEmployee(payload);
      }
      onSuccess();
    } catch (err) {
      if (err instanceof AxiosError) {
        setSubmitError(err.response?.data?.error ?? "저장에 실패했습니다");
      } else {
        setSubmitError("저장에 실패했습니다");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="employeeName" className={styles.label}>
          이름
        </label>
        <input
          id="employeeName"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={`${styles.input} ${validationErrors.name ? styles.inputError : ""}`}
          disabled={submitting}
        />
        {validationErrors.name && <span className={styles.errorText}>{validationErrors.name}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="employeeDepartment" className={styles.label}>
          부서
        </label>
        <input
          id="employeeDepartment"
          type="text"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          className={`${styles.input} ${validationErrors.department ? styles.inputError : ""}`}
          disabled={submitting}
        />
        {validationErrors.department && (
          <span className={styles.errorText}>{validationErrors.department}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="employeePosition" className={styles.label}>
          직책
        </label>
        <input
          id="employeePosition"
          type="text"
          value={position}
          onChange={(event) => setPosition(event.target.value)}
          className={`${styles.input} ${validationErrors.position ? styles.inputError : ""}`}
          disabled={submitting}
        />
        {validationErrors.position && (
          <span className={styles.errorText}>{validationErrors.position}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="employeeEmail" className={styles.label}>
          이메일
        </label>
        <input
          id="employeeEmail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`${styles.input} ${validationErrors.email ? styles.inputError : ""}`}
          disabled={submitting}
        />
        {validationErrors.email && (
          <span className={styles.errorText}>{validationErrors.email}</span>
        )}
      </div>

      {submitError && <div className={styles.submitError}>{submitError}</div>}

      <div className={styles.actions}>
        {mode === "edit" && employee?.isActive && (
          <button
            type="button"
            className={styles.deactivateBtn}
            onClick={onDeactivateClick}
            disabled={submitting}
          >
            비활성화
          </button>
        )}
        {mode === "edit" && employee && !employee.isActive && (
          <button
            type="button"
            className={styles.activateBtn}
            onClick={onActivateClick}
            disabled={submitting}
          >
            활성화
          </button>
        )}
        <div className={styles.submitActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={submitting}
          >
            취소
          </button>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? "저장 중..." : mode === "edit" ? "수정" : "등록"}
          </button>
        </div>
      </div>
    </form>
  );
}
