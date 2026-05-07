import axios, { AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: "/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
// 컴포넌트에서 apiClient.get("/attendance")로 요청하면 실제로 /api/v1/attendance로 요청

// 요청 인터셉터 (향후 인증 토큰 추가 위치)
apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("authToken");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    // 향후 401 자동 로그아웃 처리 위치
    // if (error.response?.status === 401) {
    //   window.location.href = "/login";
    // }
    return Promise.reject(error);
  }
);

export default apiClient;
