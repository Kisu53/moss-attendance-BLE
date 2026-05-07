import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: "src/.env" });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
