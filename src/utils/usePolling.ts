import { useEffect, useState } from "react";
import { AxiosError } from "axios";

type Status = "loading" | "success" | "error";

interface UsePollingResult<T> {
  data: T | null;
  status: Status;
  errorMessage: string;
}

export function usePolling<T>(fetcher: () => Promise<T>, intervalMs: number): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      fetcher()
        .then((result) => {
          if (!cancelled) {
            setData(result);
            setStatus("success");
          }
        })
        .catch((err: unknown) => {
          if (!cancelled) {
            setErrorMessage(extractErrorMessage(err));
            setStatus("error");
          }
        });
    };

    run();
    const intervalId = setInterval(run, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return { data, status, errorMessage };
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    return err.response?.data?.error ?? err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "알 수 없는 오류";
}
