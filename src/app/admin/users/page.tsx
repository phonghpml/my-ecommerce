"use client";

import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, App } from "antd";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function UsersPage() {
  const { message } = App.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .finally(() => setLoading(false));
  }, []);

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

  const handleSave = async (values: any) => {
    try {
      const res = await fetch(editingUser ? `/api/users/${editingUser.id}` : "/api/users", {
        method: editingUser ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData?.error?.issues) {
          const errors = errorData.error.issues.map((issue: any) => ({
            name: issue.path,
            errors: [issue.message],
          }));
          form.setFields(errors);
        } else {
          message.error("Thao tác thất bại");
        }
        return;
      }

      const user = await res.json();
      if (editingUser) {
        setUsers(prev => prev.map(u => (u.id === editingUser.id ? user : u)));
        message.success("Cập nhật user thành công");
      } else {
        setUsers(prev => [...prev, user]);
        message.success("Thêm user thành công");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra khi lưu user");
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers(prev => prev.filter(u => u.id !== id));
    message.success("Xóa user thành công");
  };

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(searchText.toLowerCase()) ||
      u.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: User) => (
        <Space>
          <Button type="primary" onClick={() => openModal(record)}>Sửa</Button>
          <Button danger onClick={() => handleDelete(record.id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Breadcrumbs />
      <h1 className="text-2xl font-semibold mb-6">Quản lý Users</h1>

      <div className="mb-5 flex items-center gap-4">
        <Button type="primary" onClick={() => openModal()}>+ Thêm User</Button>
        <Input.Search
          placeholder="Tìm theo tên hoặc email"
          onSearch={value => setSearchText(value)}
          className="w-72"
          allowClear
        />
      </div>

      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingUser ? "Sửa User" : "Thêm User"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Tên"
            rules={[{ required: true, min: 2, message: "Tên phải có ít nhất 2 ký tự" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email", message: "Nhập email hợp lệ" }]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, min: 6, message: "Ít nhất 6 ký tự" }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="role" label="Role" initialValue="user">
            <Select>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit">Lưu</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
