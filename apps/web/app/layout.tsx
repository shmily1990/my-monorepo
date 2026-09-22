import { AntdRegistry } from "@ant-design/nextjs-registry";
import { UiProvider } from "@repo/ui";
import type { Metadata } from "next";
import localFont from "next/font/local";

import { AppShell } from "./app-shell";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "OpenRouter 控制台",
  description: "模型目录与用量管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/*
          AntdRegistry 负责在 SSR 阶段收集 antd 的 cssinjs 样式并写进 HTML，
          否则样式只能在客户端注入，首屏会闪一下。
          UiProvider 提供统一的主题与 locale（来自 @repo/ui）。

          新应用接入时必须两个都加：只加 UiProvider 会样式闪烁，只加 AntdRegistry 则拿不到主题。
        */}
        <AntdRegistry>
          <UiProvider>
            {/*
              导航与内容区在 AppShell 里（客户端组件）。**不要在本文件里直接写 antd 组件**：
              本文件是服务端组件，而服务端拿到的客户端组件是引用代理，其静态子组件
              （如 Layout.Content）会是 undefined，构建期直接报错。详见 app-shell.tsx。
            */}
            <AppShell>{children}</AppShell>
          </UiProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
