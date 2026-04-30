import { useMemo, useState } from "react";
import { AxiosError } from "axios";
import { useFetch } from "../utils/useFetch";
import { fetchConfig, updateConfig } from "../api/config";
import { formatDate } from "../utils/date";
import styles from "./Settings.module.scss";

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

  const serverValues = useMemo(() => {
    const values: Record<string, string> = {};
    data?.data.forEach((item) => {
      values[item.key] = item.value;
    });
    return values;
  }, [data]);

  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const formValues = useMemo(
    () => ({ ...serverValues, ...draftValues }),
    [serverValues, draftValues]
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  const handleChange = (key: string, value: string) => {
    setDraftValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => prev.filter((err) => err.key !== key));
  };

  const dirtyKeys = useMemo(() => {
    return Object.keys(formValues).filter((key) => formValues[key] !== configMap.get(key));
  }, [formValues, configMap]);

  const hasChanges = dirtyKeys.length > 0;

  const handleReset = () => {
    if (data) {
      setDraftValues({});
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
      setDraftValues({});
      setRefreshKey((k) => k + 1);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setFieldErrors(errors);
      setSaveStatus("partial-error");
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
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>설정</h1>
          <p className={styles.subtitle}>ESP32 디바이스 동작과 출퇴근 처리 규칙을 관리합니다.</p>
        </div>
        {hasChanges && <span className={styles.dirtyCount}>{dirtyKeys.length}개 변경됨</span>}
      </div>

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
            <strong>시스템 설정</strong>
            <span className={styles.lastUpdated}>
              마지막 수정: {lastUpdatedAt ? formatDate(lastUpdatedAt) : "-"}
            </span>
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
