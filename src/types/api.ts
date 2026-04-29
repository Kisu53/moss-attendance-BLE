export type ApiId = number | string;
export type ISODateTimeString = string;
export type LocalDateString = string;
export type MacAddress = string;

export type ApiStatus = "ok" | "error";

export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}

export interface ApiResponse<T> {
    status: ApiStatus;
    data?: T;
    error?: ApiError;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page?: number;
    limit?: number;
}

export interface Employee {
    id: number;
    name: string;
    email: string | null;
    department: string;
    position: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeListResponse {
    data: Employee[];
    total: number;
}

export interface Beacon {
    id: ApiId;
    mac_address: MacAddress;
    employee_id: ApiId;
    label?: string | null;
    is_active: boolean;
    registered_at: ISODateTimeString;
}

export interface BeaconWithEmployee extends Beacon {
    employee?: Employee | null;
}

export interface AttendanceTodayResponse {
    date: string;
    total: number;
    checkedIn: number;
    notCheckedIn: number;
    checkedOut: number;
}

export interface AttendanceLog {
    id: number;
    employeeId: number;
    employeeName: string;
    beaconId: number;
    beaconLabel: string;
    checkIn: string; // ISO 8601 timestamp
    checkOut: string | null;
    date: string; // YYYY-MM-DD
    rssi: number;
    autoCheckout: boolean;
}

export interface AttendanceListResponse {
    data: AttendanceLog[];
    total: number;
}

export interface AttendanceLogDetail extends AttendanceLog {
    employee?: Employee;
    beacon?: Beacon;
}

export type SystemConfigKey =
    | "rssi_threshold"
    | "auto_checkout_minutes"
    | "scan_interval_seconds"
    | "work_start_hour"
    | "work_end_hour"
    | "report_interval_seconds";

export interface SystemConfig {
    key: SystemConfigKey | string;
    value: string;
    description?: string | null;
    updated_at: ISODateTimeString;
}

export interface AdminUser {
    id: ApiId;
    name: string;
    email: string;
    role?: string;
}

export interface RecentDetection {
    id: number;
    beaconLabel: string;
    employeeName: string;
    detectedAt: string;
    rssi: number;
}

export interface RecentDetectionsResponse {
    data: RecentDetection[];
}

export interface DeviceStatus {
    deviceId: string;
    online: boolean;
    lastHeartbeat: string;
    uptimeSeconds: number;
    wifiRssi: number;
}

export interface DeviceStatusResponse {
    data: DeviceStatus[];
}

export interface DetectedBeacon {
    mac: MacAddress;
    rssi: number;
    timestamp: ISODateTimeString;
}

export interface DeviceScanRequest {
    device_id: string;
    beacons: DetectedBeacon[];
}

export type DeviceScanActionType = "check_in" | "check_out" | "ignored";

export interface DeviceScanAction {
    mac: MacAddress;
    action: DeviceScanActionType;
    employee?: string;
    reason?: string;
}

export interface DeviceScanResponse {
    status: "ok";
    processed: number;
    actions: DeviceScanAction[];
}

export interface DeviceHeartbeatRequest {
    device_id: string;
    uptime_seconds: number;
    free_heap: number;
    wifi_rssi: number;
}

export interface DeviceHeartbeatResponse {
    status: "ok";
    config_updated: boolean;
}

export interface DeviceConfigResponse {
    rssi_threshold: number;
    scan_interval_seconds: number;
    report_interval_seconds: number;
    auto_checkout_minutes: number;
    registered_macs: MacAddress[];
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: AdminUser;
    expires_at?: ISODateTimeString;
}

export interface MeResponse {
    user: AdminUser;
}

export interface EmployeeListQuery {
    is_active?: boolean;
}

export interface CreateEmployeeRequest {
    name: string;
    department: string;
    position: string;
    email?: string;
}

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest> & {
    is_active?: boolean;
};

export interface CreateBeaconRequest {
    mac_address: MacAddress;
    employee_id: ApiId;
    label?: string;
}

export interface UpdateBeaconRequest {
    mac_address?: MacAddress;
    employee_id?: ApiId;
    label?: string | null;
    is_active?: boolean;
}

export interface AttendanceListQuery {
    date?: LocalDateString;
    employee_id?: ApiId;
    from?: LocalDateString;
    to?: LocalDateString;
    department?: string;
}

export interface TodayAttendanceStatus {
    employee: Employee;
    attendance: AttendanceLogDetail | null;
    status: "not_checked_in" | "checked_in" | "checked_out";
}

export interface TodayAttendanceResponse {
    date: LocalDateString;
    checked_in_count: number;
    not_checked_in_count: number;
    checked_out_count: number;
    employees: TodayAttendanceStatus[];
}

export interface AttendanceSummaryQuery {
    from: LocalDateString;
    to: LocalDateString;
    employee_id?: ApiId;
    department?: string;
}

export interface AttendanceSummaryItem {
    employee: Employee;
    work_days: number;
    late_count: number;
    average_check_in: string | null;
    total_work_minutes: number;
}

export interface AttendanceSummaryResponse {
    from: LocalDateString;
    to: LocalDateString;
    items: AttendanceSummaryItem[];
}

export interface UpdateAttendanceRequest {
    check_in?: ISODateTimeString;
    check_out?: ISODateTimeString | null;
    memo?: string | null;
}

export interface ManualAttendanceRequest {
    employee_id: ApiId;
    date: LocalDateString;
    check_in: ISODateTimeString;
    check_out?: ISODateTimeString | null;
    memo?: string;
}

export interface RealtimeDetection {
    employee: Employee;
    beacon: Beacon;
    detected_at: ISODateTimeString;
    rssi: number;
    device_id: string;
}

export interface DashboardRealtimeResponse {
    present_count: number;
    absent_count: number;
    checked_out_count: number;
    recent_detections: RealtimeDetection[];
}

export interface DashboardStatsQuery {
    from?: LocalDateString;
    to?: LocalDateString;
    month?: string;
}

export interface DashboardStatsResponse {
    average_check_in: string | null;
    late_rate: number;
    average_work_minutes: number;
    total_work_days: number;
}

export interface UpdateConfigRequest {
    value: string;
}

export const API_BASE_PATH = "/api/v1" as const;

export const API_ENDPOINTS = {
    device: {
        scan: "/device/scan",
        heartbeat: "/device/heartbeat",
        config: "/device/config",
    },
    auth: {
        login: "/auth/login",
        logout: "/auth/logout",
        me: "/auth/me",
    },
    employees: {
        list: "/employees",
        detail: (id: ApiId) => `/employees/${id}`,
    },
    beacons: {
        list: "/beacons",
        detail: (id: ApiId) => `/beacons/${id}`,
    },
    attendance: {
        list: "/attendance",
        today: "/attendance/today",
        summary: "/attendance/summary",
        detail: (id: ApiId) => `/attendance/${id}`,
        manual: "/attendance/manual",
    },
    dashboard: {
        realtime: "/dashboard/realtime",
        stats: "/dashboard/stats",
        deviceStatus: "/dashboard/device-status",
    },
    config: {
        list: "/config",
        detail: (key: SystemConfigKey | string) => `/config/${key}`,
    },
} as const;
