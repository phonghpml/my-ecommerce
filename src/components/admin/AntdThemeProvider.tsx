"use client";

import { ConfigProvider, theme } from "antd";
import { useEffect, useState } from "react";

export default function AntdThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1890ff", // Daybreak Blue mặc định
        },
      }}
      
    >
      {children}
    </ConfigProvider>
  );
}
