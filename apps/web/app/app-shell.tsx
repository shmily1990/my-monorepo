"use client";

import { Layout } from "@repo/ui";

import { AppHeader } from "./app-header";

/**
 * 应用外壳：顶部导航 + 内容区。将来的侧边栏之类也放这里。
 *
 * 为什么必须是客户端组件，而不是直接在 layout.tsx 里写：
 *
 *   antd 6 的构建自带 "use client"，所以它的组件本身就是客户端组件。当**服务端组件**
 *   引入一个客户端组件时，拿到的是「客户端引用」（client reference）而不是真实组件对象
 *   —— 而引用代理上**只有默认导出，没有静态子组件**。所以服务端组件里写 `<Layout.Content>`
 *   会渲染成 undefined，构建期报 "Element type is invalid ... got: undefined"。
 *
 *   把外壳放进客户端组件后，`Layout.Content` 在客户端模块里解析，静态成员就正常了。
 *
 * children 由 layout.tsx（服务端组件）传进来，仍按服务端渲染 —— 这是 RSC 的标准组合方式。
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Layout.Content>{children}</Layout.Content>
    </Layout>
  );
}
