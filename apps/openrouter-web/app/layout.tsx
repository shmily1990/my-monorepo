import { AntdRegistry } from "@ant-design/nextjs-registry";
import { UiProvider } from "@repo/ui";
import type { Metadata } from "next";

import { AuthDialogProvider } from "@/features/auth";

import "@/styles/tokens.scss";

import "./globals.css";

export const metadata: Metadata = {
  title: "OpenRouter",
  description: "模型目录与用量管理",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {/*
          AntdRegistry 负责在 SSR 阶段收集 antd 的 cssinjs 样式并写进 HTML，
          否则样式只能在客户端注入，首屏会闪一下。
          UiProvider 提供统一的主题与 locale（来自 @repo/ui）。

          两者必须同时存在：只加 UiProvider 会样式闪烁，只加 AntdRegistry 则拿不到共享主题。

          字体不走 next/font —— 脚手架自带的 next/font/google 会在构建期联网抓取字体，
          是构建期的一个网络依赖。字体栈改由 styles/tokens.scss 的 --or-font-sans 定义
          （@repo/ui/src/theme.ts 只设了 colorPrimary 与 borderRadius，它并没有字体栈）。
        */}
        <AntdRegistry>
          <UiProvider>
            {/*
              AuthDialogProvider 持有登录/注册弹框的开关状态，并且把弹框本体挂在这里
              —— 因此任何路由（首页的「Get API Key」、header 的「Sign Up」）都能打开它，
              不必让 header 去承担这个职责。
            */}
            <AuthDialogProvider>{children}</AuthDialogProvider>
          </UiProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
