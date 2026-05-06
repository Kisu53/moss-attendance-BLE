import { useState } from "react";
import { AxiosError } from "axios";
import Modal from "./Modal";
import styles from "./ConfirmDialog.module.scss";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "primary",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setError("");
    setSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error ?? "처리에 실패했습니다");
      } else {
        setError("처리에 실패했습니다");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className={styles.cancelBtn}
            disabled={submitting}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`${styles.confirmBtn} ${
              variant === "danger" ? styles.danger : styles.primary
            }`}
            disabled={submitting}
          >
            {submitting ? "처리 중..." : confirmLabel}
          </button>
        </>
      }
    >
      <p className={styles.message}>{message}</p>
      {error && <div className={styles.error}>{error}</div>}
    </Modal>
  );
}
