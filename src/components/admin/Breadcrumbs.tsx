"use client";

import { Breadcrumb } from "antd";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter(Boolean);

    // Tạo mảng items cho Breadcrumb
    const items = pathSegments.map((segment, index) => {
        const url = "/" + pathSegments.slice(0, index + 1).join("/");
        return {
            title: <a href={url}>{segment.charAt(0).toUpperCase() + segment.slice(1)}</a>,
        };
    });

    return <Breadcrumb style={{ marginBottom: 16 }} items={items} />;
}
