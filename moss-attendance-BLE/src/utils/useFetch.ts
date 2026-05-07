import { useEffect, useState } from "react";
import { AxiosError } from "axios";

type Status = "loading" | "success" | "error";

interface UseFetchResult<T> {
  data: T | null;
  status: Status;
  errorMessage: string;
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

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

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

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
