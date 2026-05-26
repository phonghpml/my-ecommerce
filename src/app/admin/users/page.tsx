// src/app/admin/users/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, App, Popconfirm } from "antd";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function UsersPage() {
  const { message: messageApi } = App.useApp();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  
  // State quản lý giá trị ô nhập và giá trị sau khi đã Trì hoãn (Debounce)
  const [searchInputValue, setSearchInputValue] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  // 🌟 Hiệu ứng Debounce: Chờ người dùng dừng gõ 400ms rồi mới đổi State tìm kiếm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchInputValue);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInputValue]);

  // 🌟 CẢI TIẾN: Hàm Fetch dữ liệu nhận vào từ khóa tìm kiếm để gửi lên Server
  const fetchUsers = useCallback((searchKeyword: string = "") => {
    setLoading(true);
    
    // Gắn tham số tìm kiếm vào URL API
    const url = searchKeyword 
      ? `/api/users?search=${encodeURIComponent(searchKeyword)}` 
      : "/api/users";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => messageApi.error("Không thể tải danh sách người dùng"))
      .finally(() => setLoading(false));
  }, [messageApi]);

  // 🌟 Theo dõi: Cứ khi nào người dùng gõ xong (debouncedSearchText thay đổi) là kích hoạt gọi API
  useEffect(() => {
    fetchUsers(debouncedSearchText);
  }, [debouncedSearchText, fetchUsers]);

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue({ name: user.name, email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSave = async (values: any) => {
    try {
      const res = await fetch(editingUser ? `/api/users/${editingUser.id}` : "/api/users", {
        method: editingUser ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMsg = result.error || "";
        const lowErrorMsg = errorMsg.toLowerCase();

        if (lowErrorMsg.includes("email") || lowErrorMsg.includes("tên") || lowErrorMsg.includes("tài khoản")) {
          const fieldsWithErrors: any[] = [];

          if (lowErrorMsg.includes("email")) {
            const emailError = errorMsg.split(" | ").find((msg: string) => msg.toLowerCase().includes("email"));
            fieldsWithErrors.push({ name: "email", errors: [emailError] });
          }

          if (lowErrorMsg.includes("tên") || lowErrorMsg.includes("tài khoản")) {
            const nameError = errorMsg.split(" | ").find((msg: string) => msg.toLowerCase().includes("tên") || msg.toLowerCase().includes("khoản"));
            fieldsWithErrors.push({ name: "name", errors: [nameError] });
          }

          form.setFields(fieldsWithErrors);
        } else {
          messageApi.error(errorMsg || "Thao tác thất bại");
        }
        return;
      }

      messageApi.success(editingUser ? "Cập nhật thành công" : "Thêm người dùng thành công");
      closeModal();
      fetchUsers(debouncedSearchText); // 🌟 Tải lại danh sách chuẩn xác theo từ khóa đang tìm
    } catch (err) {
      console.error(err);
      messageApi.error("Có lỗi xảy ra khi lưu dữ liệu");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const result = await res.json();
      
      if (!res.ok) {
        messageApi.error(result.error || "Xóa thất bại");
        return;
      }

      messageApi.success("Xóa người dùng thành công");
      fetchUsers(debouncedSearchText); // 🌟 Gọi API lấy lại danh sách mới sau khi xóa
    } catch (err) {
      messageApi.error("Lỗi hệ thống không thể xóa");
    }
  };

  // Hàm Highlight từ khóa trên giao diện (Vẫn giữ lại để tăng UX)
  const renderHighlightText = (text: string) => {
    if (!debouncedSearchText) return text;
    const regex = new RegExp(`(${debouncedSearchText})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-amber-200 text-black p-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const columns = [
    { 
      title: "Tên", 
      dataIndex: "name", 
      key: "name",
      render: (text: string) => renderHighlightText(text)
    },
    { 
      title: "Email", 
      dataIndex: "email", 
      key: "email",
      render: (text: string) => renderHighlightText(text)
    },
    { 
      title: "Quyền hạn", 
      dataIndex: "role", 
      key: "role",
      render: (role: string) => (
        <span className={role === "admin" ? "text-red-500 font-medium" : "text-gray-600"}>
          {role.toUpperCase()}
        </span>
      )
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button type="link" className="p-0" onClick={() => openModal(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa tài khoản này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger className="p-0">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumbs />
      <h1 className="text-2xl font-semibold mb-6">Quản lý Users</h1>

      <div className="mb-5 flex items-center justify-between gap-4">
        <Input.Search
          placeholder="Tìm kiếm bằng API tên hoặc email..."
          value={searchInputValue}
          onChange={(e) => setSearchInputValue(e.target.value)}
          onClear={() => setSearchInputValue("")}
          className="w-80"
          allowClear
          // Hiển thị vòng xoay loading của ô tìm kiếm trong lúc chờ debounce gửi API hoặc API đang load
          loading={loading || searchInputValue !== debouncedSearchText} 
        />
        <Button type="primary" onClick={() => openModal()}>+ Thêm User</Button>
      </div>

      <Table
        dataSource={users} // 🌟 SỬA: Dùng trực tiếp State `users` trả về từ API thay vì mảng filter client cũ
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{ pageSize: 8, showSizeChanger: false }}
      />

      {/* Cấu trúc phần <Modal> giữ nguyên như file cũ của bạn */}
      <Modal
        title={editingUser ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} className="mt-4" preserve={false} autoComplete="off">
          <Form.Item name="name" label="Tên người dùng" rules={[{ required: true, message: "Vui lòng nhập tên người dùng" }]}>
            <Input placeholder="Ví dụ: Nguyễn Văn A" autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="email" label="Địa chỉ Email" rules={[{ required: true, message: "Vui lòng nhập email" }]}>
            <Input placeholder="example@domain.com" disabled={!!editingUser} autoComplete="new-password" />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Mật khẩu khởi tạo" rules={[{ required: true, message: "Vui lòng nhập mật khẩu khởi tạo" }]}>
              <Input.Password placeholder="Tối thiểu 6 ký tự" autoComplete="new-password" />
            </Form.Item>
          )}
          <Form.Item name="role" label="Phân quyền tài khoản" initialValue="user">
            <Select>
              <Select.Option value="user">User (Thành viên)</Select.Option>
              <Select.Option value="admin">Admin (Quản trị viên)</Select.Option>
            </Select>
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={closeModal}>Hủy bỏ</Button>
            <Button type="primary" htmlType="submit">Xác nhận Lưu</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}