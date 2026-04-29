import { useEffect, useState } from "react";

type Status = "loading" | "success" | "error";

interface UsePollingResult<T> {
    data: T | null;
    status: Status;
    errorMessage: string;
}

export function usePolling<T>(url: string, intervalMs: number): UsePollingResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<Status>("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`서버 응답 오류: ${res.status}`);
                }
                const json: T = await res.json();
                if (!cancelled) {
                    setData(json);
                    setStatus("success");
                }
            } catch (err) {
                if (!cancelled) {
                    setErrorMessage(err instanceof Error ? err.message : "알 수 없는 오류");
                    setStatus("error");
                }
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, intervalMs);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
        };
    }, [url, intervalMs]);

    return { data, status, errorMessage };
}
