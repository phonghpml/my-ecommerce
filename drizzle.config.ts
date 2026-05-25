import { defineConfig } from "drizzle-kit";
import "./envConfig";

export default defineConfig({
  schema: "./src/db/schema.ts", // nơi định nghĩa schema
  out: "./src/db/migrations",   // nơi lưu migration SQL
  dialect: "postgresql",        // dùng dialect thay vì driver
  dbCredentials: {
    url: process.env.DATABASE_URL!, // lấy từ Supabase
  },
});
