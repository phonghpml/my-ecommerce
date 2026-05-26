import bcrypt from "bcryptjs"; 
import { db } from "./client";
import { users, categories, products, orders, orderItems } from "./schema";

async function main() {
  console.log("⏳ Đang dọn dẹp dữ liệu cũ để tránh trùng lặp...");
  // Xóa theo thứ tự từ bảng phụ (nhiều khóa ngoại) đến bảng chính để tránh lỗi Constraint
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(users);

  console.log("🔐 Đang băm mật khẩu mẫu...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("phong123", 10);

  console.log("👤 Tạo các tài khoản cố định...");
  // 1. Tạo user admin cố định
  const [admin] = await db.insert(users).values({
    name: "Admin",
    email: "admin@example.com",
    passwordHash: adminPassword,
    role: "admin", 
  }).returning();

  // 2. Tạo user thường cố định
  const [user] = await db.insert(users).values({
    name: "Phong",
    email: "phong@example.com",
    passwordHash: userPassword,
    role: "user", 
  }).returning();


  console.log("👥 Tự động tạo thêm 50 users mẫu bằng mảng kiểm soát kiểu dữ liệu...");
  
  // Định nghĩa rõ kiểu dữ liệu Insert của bảng users cho mảng bulk
  const fakeUsersData: (typeof users.$inferInsert)[] = [];
  
  // Họ và tên mẫu để trộn ngẫu nhiên dữ liệu test công cụ tìm kiếm
  const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Đặng", "Bùi"];
  const middleNames = ["Văn", "Thị", "Đức", "Minh", "Hồng", "Tuấn", "Anh", "Ngọc", "Quang"];
  const lastNames = ["An", "Bình", "Cường", "Dũng", "Em", "Hùng", "Hải", "Khanh", "Linh", "Nam", "Phúc", "Tâm", "Sơn"];

  for (let i = 1; i <= 50; i++) {
    const rFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
    const rMiddle = middleNames[Math.floor(Math.random() * middleNames.length)];
    const rLast = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${rFirst} ${rMiddle} ${rLast} ${i}`; 

    const emailPrefix = `${rLast.toLowerCase()}.${rFirst.toLowerCase()}${i}`;
    
    // 🌟 ĐÃ SỬA LỖI: Định nghĩa rõ Literal Type cho biến để khớp tuyệt đối với Enum của Schema mà không gây lỗi cú pháp TypeScript
    const assignedRole: "admin" | "user" = i % 5 === 0 ? "admin" : "user";
    const currentHash = assignedRole === "admin" ? adminPassword : userPassword;

    fakeUsersData.push({
      name: fullName,
      email: `${emailPrefix}@test.com`,
      passwordHash: currentHash,
      role: assignedRole, 
    });
  }

  // Chèn hàng loạt 50 user bản ghi bằng một câu lệnh duy nhất
  await db.insert(users).values(fakeUsersData);


  console.log("🛍️ Tạo danh mục sản phẩm mẫu...");
  const [electronics] = await db.insert(categories).values({
    name: "Electronics",
    description: "Thiết bị điện tử",
  }).returning();

  const [fashion] = await db.insert(categories).values({
    name: "Fashion",
    description: "Quần áo và phụ kiện",
  }).returning();

  console.log("📦 Tạo sản phẩm mẫu...");
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

  console.log("🧾 Tạo hóa đơn mẫu...");
  const [order] = await db.insert(orders).values({
    userId: user.id,
    status: "pending",
    totalPrice: "25200000",
  }).returning();

  console.log("🛒 Thêm chi tiết các mặt hàng vào hóa đơn...");
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

  console.log("✅ HỆ THỐNG SEED: Chạy thành công dữ liệu môi trường Test!");
}

main().catch((err) => {
  console.error("❌ Lỗi nghiêm trọng khi đang thực thi file seed:", err);
  process.exit(1);
});