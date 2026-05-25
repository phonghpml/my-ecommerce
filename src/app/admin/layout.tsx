"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layout, Menu, Avatar } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { handleLogout } from "@/utils/auth";

const { Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const adminInfo = { name: "Admin", email: "admin@example.com" };

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link href="/admin">Dashboard</Link>,
    },
    {
      key: "/admin/products",
      icon: <ShoppingOutlined />,
      label: <Link href="/admin/products">Products</Link>,
    },
    {
      key: "/admin/orders",
      icon: <ShoppingCartOutlined />,
      label: <Link href="/admin/orders">Orders</Link>,
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: <Link href="/admin/users">Users</Link>,
    },
    {
      key: "account",
      icon: <UserOutlined />,
      label: `${adminInfo.name}`,
      children: [
        {
          key: "admin-info",
          icon: <UserOutlined />,
          label: "Profile",
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: "Đăng xuất",
          onClick: handleLogout
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={220}>
        <div style={{ color: "#fff", padding: "16px", fontWeight: "bold" }}>Admin</div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={["account"]}
          items={menuItems}
          theme="dark"
          style={{ height: "100%" }}
        />
      </Sider>

      <Layout>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
