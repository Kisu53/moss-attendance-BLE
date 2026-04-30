import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { useFetch } from "../utils/useFetch";
import { fetchEmployees } from "../api/employees";
import { createBeacon } from "../api/beacons";
import type { CreateBeaconRequest } from "../types/api";
import styles from "./BeaconForm.module.scss";

interface BeaconFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MAC_PATTERN = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i;

export default function BeaconForm({ onSuccess, onCancel }: BeaconFormProps) {
  const [macAddress, setMacAddress] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    macAddress?: string;
    employeeId?: string;
    label?: string;
  }>({});

  const { data: employeesData, status: employeesStatus } = useFetch(() => fetchEmployees("true"));

  const validate = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!macAddress.trim()) {
      errors.macAddress = "MAC 주소를 입력하세요";
    } else if (!MAC_PATTERN.test(macAddress)) {
      errors.macAddress = "형식: AA:BB:CC:DD:EE:FF";
    }

    if (!employeeId) {
      errors.employeeId = "직원을 선택하세요";
    }

    if (!label.trim()) {
      errors.label = "비콘 라벨을 입력하세요";
    } else if (label.length > 50) {
      errors.label = "50자 이내로 입력하세요";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: CreateBeaconRequest = {
        macAddress: macAddress.toUpperCase(),
        employeeId: Number(employeeId),
        label: label.trim(),
      };
      await createBeacon(payload);
      onSuccess();
    } catch (err) {
      if (err instanceof AxiosError) {
        setSubmitError(err.response?.data?.error ?? "등록에 실패했습니다");
      } else {
        setSubmitError("등록에 실패했습니다");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const employees = employeesData?.data ?? [];

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.field}>
        <label htmlFor="macAddress" className={styles.label}>
          MAC 주소
        </label>
        <input
          id="macAddress"
          type="text"
          value={macAddress}
          onChange={(e) => setMacAddress(e.target.value)}
          placeholder="AA:BB:CC:DD:EE:FF"
          className={`${styles.input} ${validationErrors.macAddress ? styles.inputError : ""}`}
          disabled={submitting}
        />
        {validationErrors.macAddress && (
          <span className={styles.errorText}>{validationErrors.macAddress}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="employeeId" className={styles.label}>
          할당 직원
        </label>
        <select
          id="employeeId"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className={`${styles.input} ${validationErrors.employeeId ? styles.inputError : ""}`}
          disabled={submitting || employeesStatus !== "success"}
        >
          <option value="">
            {employeesStatus === "loading" ? "직원 목록 로딩 중..." : "직원을 선택하세요"}
          </option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.department})
            </option>
          ))}
        </select>
        {validationErrors.employeeId && (
          <span className={styles.errorText}>{validationErrors.employeeId}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="label" className={styles.label}>
          비콘 라벨
        </label>
        <input
          id="label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="예: 카드-005"
          className={`${styles.input} ${validationErrors.label ? styles.inputError : ""}`}
          disabled={submitting}
          maxLength={50}
        />
        {validationErrors.label && (
          <span className={styles.errorText}>{validationErrors.label}</span>
        )}
      </div>

      {submitError && <div className={styles.submitError}>{submitError}</div>}

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={submitting}>
          취소
        </button>
        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
