import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { InferModel } from "drizzle-orm";

// 🧩 Enum cho vai trò người dùng và trạng thái đơn hàng
export const userRole = pgEnum("user_role", ["user", "admin"]);
export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "shipped",
  "completed",
  "cancelled",
]);

// 👤 Bảng người dùng
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 🛍️ Bảng danh mục sản phẩm
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

// 📦 Bảng sản phẩm
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  stock: integer("stock").default(0),
  categoryId: uuid("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// 🧾 Bảng đơn hàng
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  status: orderStatus("status").default("pending"),
  totalPrice: numeric("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 🛒 Bảng chi tiết đơn hàng
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id").references(() => orders.id),
  productId: uuid("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
});

// 🧠 Bảng log admin (tuỳ chọn)
export const adminLogs = pgTable("admin_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id").references(() => users.id),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});
