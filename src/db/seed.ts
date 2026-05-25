import bcrypt from "bcrypt";
import { db } from "./client";
import { users, categories, products, orders, orderItems } from "./schema";

async function main() {
  // 🔐 Hash mật khẩu
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("phong123", 10);

  // 👤 Tạo user admin
  const [admin] = await db.insert(users).values({
    name: "Admin",
    email: "admin@example.com",
    passwordHash: adminPassword,
    role: "admin",
  }).returning();

  // 👤 Tạo user thường
  const [user] = await db.insert(users).values({
    name: "Phong",
    email: "phong@example.com",
    passwordHash: userPassword,
    role: "user",
  }).returning();

  // 🛍️ Tạo danh mục
  const [electronics] = await db.insert(categories).values({
    name: "Electronics",
    description: "Thiết bị điện tử",
  }).returning();

  const [fashion] = await db.insert(categories).values({
    name: "Fashion",
    description: "Quần áo và phụ kiện",
  }).returning();

  // 📦 Tạo sản phẩm
  const [phone] = await db.insert(products).values({
    name: "iPhone 15",
    description: "Điện thoại Apple mới nhất",
    price: "25000000",
    stock: 10,
    categoryId: electronics.id,
  }).returning();

  const [shirt] = await db.insert(products).values({
    name: "Áo thun",
    description: "Áo thun cotton",
    price: "200000",
    stock: 50,
    categoryId: fashion.id,
  }).returning();

  // 🧾 Tạo đơn hàng
  const [order] = await db.insert(orders).values({
    userId: user.id,
    status: "pending",
    totalPrice: "25200000",
  }).returning();

  // 🛒 Thêm chi tiết đơn hàng
  await db.insert(orderItems).values([
    {
      orderId: order.id,
      productId: phone.id,
      quantity: 1,
      price: "25000000",
    },
    {
      orderId: order.id,
      productId: shirt.id,
      quantity: 1,
      price: "200000",
    },
  ]);

  console.log("✅ Seed dữ liệu mẫu thành công!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
