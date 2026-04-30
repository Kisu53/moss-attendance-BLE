import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useFetch } from "../utils/useFetch";
import { fetchConfig, updateConfig } from "../api/config";
import { formatDate } from "../utils/date";
import styles from "./Settings.module.css";

type ConfigInputType = "number-negative" | "number-positive" | "time";

interface ConfigFieldMeta {
  key: string;
  label: string;
  inputType: ConfigInputType;
  unit?: string;
  min?: number;
  max?: number;
}

const CONFIG_FIELDS: ConfigFieldMeta[] = [
  {
    key: "rssi_threshold",
    label: "RSSI 임계값",
    inputType: "number-negative",
    unit: "dBm",
    min: -100,
    max: 0,
  },
  {
    key: "auto_checkout_minutes",
    label: "자동 퇴근 처리 시간",
    inputType: "number-positive",
    unit: "분",
    min: 1,
  },
  {
    key: "scan_interval_seconds",
    label: "스캔 주기",
    inputType: "number-positive",
    unit: "초",
    min: 1,
  },
  {
    key: "work_start_hour",
    label: "근무 시작 시간",
    inputType: "time",
  },
  {
    key: "work_end_hour",
    label: "근무 종료 시간",
    inputType: "time",
  },
];

type SaveStatus = "idle" | "saving" | "success" | "partial-error";

interface FieldError {
  key: string;
  message: string;
}

export default function Settings() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, status, errorMessage } = useFetch(() => fetchConfig(), [refreshKey]);

  const configMap = useMemo(() => {
    const map = new Map<string, string>();
    data?.data.forEach((item) => map.set(item.key, item.value));
    return map;
  }, [data]);

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  useEffect(() => {
    if (data) {
      const initial: Record<string, string> = {};
      data.data.forEach((item) => {
        initial[item.key] = item.value;
      });
      setFormValues(initial);
    }
  }, [data]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    // 에러 메시지 표시 중이었으면 해당 필드만 클리어
    setFieldErrors((prev) => prev.filter((err) => err.key !== key));
  };

  // 변경된 필드만 추출
  const dirtyKeys = useMemo(() => {
    return Object.keys(formValues).filter((key) => formValues[key] !== configMap.get(key));
  }, [formValues, configMap]);

  const hasChanges = dirtyKeys.length > 0;

  const handleReset = () => {
    if (data) {
      const initial: Record<string, string> = {};
      data.data.forEach((item) => {
        initial[item.key] = item.value;
      });
      setFormValues(initial);
      setFieldErrors([]);
    }
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setFieldErrors([]);

    const results = await Promise.allSettled(
      dirtyKeys.map((key) => updateConfig(key, formValues[key]))
    );

    const errors: FieldError[] = [];
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        const key = dirtyKeys[index];
        const reason = result.reason;
        let message = "저장에 실패했습니다";
        if (reason instanceof AxiosError) {
          message = reason.response?.data?.error ?? message;
        }
        errors.push({ key, message });
      }
    });

    if (errors.length === 0) {
      setSaveStatus("success");
      setRefreshKey((k) => k + 1);
      // 잠시 후 success 표시 자동 제거
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setFieldErrors(errors);
      setSaveStatus("partial-error");
      // 성공한 것만이라도 반영
      if (errors.length < dirtyKeys.length) {
        setRefreshKey((k) => k + 1);
      }
    }
  };

  const lastUpdatedAt = data?.data
    .map((item) => item.updatedAt)
    .sort()
    .reverse()[0];

  return (
    <div>
      <h1 className={styles.title}>시스템 설정</h1>
      <p className={styles.subtitle}>ESP32 디바이스 동작과 출퇴근 처리 규칙을 관리합니다.</p>

      {status === "loading" && <div className={styles.message}>로딩 중...</div>}

      {status === "error" && (
        <div className={styles.message}>
          <p>설정을 불러오지 못했습니다.</p>
          <p className={styles.errorDetail}>{errorMessage}</p>
        </div>
      )}

      {status === "success" && data && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <span className={styles.lastUpdated}>
              마지막 수정: {lastUpdatedAt ? formatDate(lastUpdatedAt) : "-"}
            </span>
            {hasChanges && (
              <span className={styles.dirtyCount}>{dirtyKeys.length}개 항목 변경됨</span>
            )}
          </div>

          <div className={styles.fieldList}>
            {CONFIG_FIELDS.map((field) => (
              <ConfigField
                key={field.key}
                meta={field}
                value={formValues[field.key] ?? ""}
                originalValue={configMap.get(field.key) ?? ""}
                description={data.data.find((item) => item.key === field.key)?.description ?? ""}
                error={fieldErrors.find((err) => err.key === field.key)?.message}
                disabled={saveStatus === "saving"}
                onChange={(value) => handleChange(field.key, value)}
              />
            ))}
          </div>

          <div className={styles.formFooter}>
            {saveStatus === "success" && (
              <span className={styles.successMessage}>저장되었습니다</span>
            )}
            {saveStatus === "partial-error" && (
              <span className={styles.errorMessage}>일부 항목 저장에 실패했습니다</span>
            )}
            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleReset}
                className={styles.resetBtn}
                disabled={!hasChanges || saveStatus === "saving"}
              >
                되돌리기
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={styles.saveBtn}
                disabled={!hasChanges || saveStatus === "saving"}
              >
                {saveStatus === "saving" ? "저장 중..." : `저장 (${dirtyKeys.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ConfigFieldProps {
  meta: ConfigFieldMeta;
  value: string;
  originalValue: string;
  description: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function ConfigField({
  meta,
  value,
  originalValue,
  description,
  error,
  disabled,
  onChange,
}: ConfigFieldProps) {
  const isDirty = value !== originalValue;

  return (
    <div className={styles.field}>
      <div className={styles.fieldHeader}>
        <label htmlFor={meta.key} className={styles.label}>
          {meta.label}
        </label>
        {isDirty && !error && <span className={styles.dirtyBadge}>변경됨</span>}
        {error && <span className={styles.errorBadge}>저장 실패</span>}
      </div>
      <p className={styles.description}>{description}</p>
      <div className={styles.inputRow}>
        <input
          id={meta.key}
          type={meta.inputType === "time" ? "time" : "number"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={meta.min}
          max={meta.max}
          disabled={disabled}
          className={`${styles.input} ${
            error ? styles.inputError : isDirty ? styles.inputDirty : ""
          }`}
        />
        {meta.unit && <span className={styles.unit}>{meta.unit}</span>}
      </div>
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  );
}
