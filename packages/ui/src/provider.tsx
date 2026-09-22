"use client";

import { App, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import type { ReactNode } from "react";

import { theme } from "./theme";

/**
 * @repo/ui 的根 Provider。子应用在自己的 layout 里包一层即可，主题与 locale 全仓库统一。
 *
 * 外层 ConfigProvider 提供主题与语言；内层 antd App 提供 message / notification / Modal
 * 的上下文，让这些弹出层能拿到主题。
 *
 * 应用里要用 `App.useApp()` 取 message，不要 `import { message } from "antd"` ——
 * 静态方法拿不到 ConfigProvider 的主题，React 19 下还会触发告警。
 */
export function UiProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
