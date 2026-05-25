import "../../envConfig";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { createClient } from "@supabase/supabase-js";
import { WebSocket } from "ws";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      transport: WebSocket as unknown as WebSocketLikeConstructor, // ép kiểu
    },
  }
);
