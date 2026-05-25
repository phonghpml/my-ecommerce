import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// =========================================================================
// 🧩 ENUMS DEFINITION (Định nghĩa các kiểu Enum cho Postgres)
// =========================================================================

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const orderStatus = pgEnum("order_status", [
  "pending",   // Chờ thanh toán / Chờ xử lý
  "paid",      // Đã thanh toán
  "shipped",   // Đang giao hàng
  "completed", // Đã hoàn thành
  "cancelled", // Đã hủy
]);

// =========================================================================
// 🗄️ TABLES DEFINITION (Định nghĩa cấu trúc các Bảng)
// =========================================================================

// 👤 1. Bảng người dùng (Users)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // Tên tài khoản / Username (Duy nhất)
  email: text("email").notNull().unique(), // Email đăng nhập (Duy nhất)
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});


// 🛍️ 2. Bảng danh mục sản phẩm (Categories)
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});


// 📦 3. Bảng sản phẩm (Products)
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  // precision: 12 (tổng số chữ số), scale: 2 (số chữ số sau dấu phẩy). Hợp lý cho cả VNĐ lẫn USD
  price: numeric("price", { precision: 12, scale: 2 }).notNull(), 
  stock: integer("stock").default(0).notNull(), // Tránh giá trị null để không lỗi khi tính toán tồn kho
  // onDelete: "set null" -> Nếu xóa danh mục, sản phẩm thuộc danh mục đó sẽ có category_id = null (không bị xóa mất sản phẩm)
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("product_category_idx").on(table.categoryId), // Tối ưu khi lọc sản phẩm theo danh mục
]);


// 🧾 4. Bảng đơn hàng (Orders)
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  // onDelete: "restrict" -> Không cho phép xóa tài khoản user nếu họ đã có lịch sử đơn hàng
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  status: orderStatus("status").default("pending").notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("order_user_idx").on(table.userId), // Tối ưu khi tìm kiếm lịch sử đơn hàng của một user
]);


// 🛒 5. Bảng chi tiết đơn hàng (Order Items)
export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  // onDelete: "cascade" -> Nếu đơn hàng bị xóa, các dòng chi tiết thuộc đơn đó tự động xóa theo
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  // onDelete: "restrict" -> Chặn xóa sản phẩm nếu sản phẩm đó đã từng được mua (để tránh mất dữ liệu hóa đơn cũ)
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(), // Lưu lại giá tại thời điểm mua (đề phòng sản phẩm đổi giá sau này)
}, (table) => [
  index("order_item_order_idx").on(table.orderId), // Tối ưu khi lấy danh sách sản phẩm thuộc một đơn hàng
]);


// 🧠 6. Bảng lưu lịch sử hoạt động của Admin (Admin Logs)
export const adminLogs = pgTable("admin_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  // onDelete: "cascade" -> Nếu tài khoản admin bị xóa, log của admin đó cũng tự động xóa theo
  adminId: uuid("admin_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // Nội dung hành động (ví dụ: "Xóa sản phẩm A", "Cập nhật đơn hàng B")
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("admin_log_idx").on(table.adminId), // Tối ưu khi tra cứu lịch sử thao tác của một admin cụ thể
]);

export const verificationTokens = pgTable("verification_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull(), // Lưu mã OTP (ví dụ: 6 chữ số)
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("verification_email_idx").on(table.email), // Tối ưu khi tìm kiếm OTP theo email của user
]);