import dotenv from "dotenv";

dotenv.config();
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: "src/.env" });
}

function getRequiredEnv(name: string) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function getNumberEnv(name: string, fallback: number) {
    const value = process.env[name];
    if (!value) return fallback;

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        throw new Error(`Environment variable ${name} must be a number.`);
    }
    return parsed;
}

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: getNumberEnv("PORT", 4000),
    DATABASE_URL: getRequiredEnv("DATABASE_URL"),
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    GOOGLE_CLIENT_ID: getRequiredEnv("GOOGLE_CLIENT_ID"),
    JWT_SECRET: getRequiredEnv("JWT_SECRET"),
};
