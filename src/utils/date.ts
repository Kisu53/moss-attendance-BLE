// "2026-04-27T09:02:14+09:00" 같은 ISO 문자열을 "09:02"처럼 보기 좋게 변환하는 유틸

export function formatTime(isoString: string | null): string {
  if (!isoString) return "-";

  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatDate(isoOrDate: string): string {
  const date = new Date(isoOrDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return formatDate(new Date().toISOString());
}
