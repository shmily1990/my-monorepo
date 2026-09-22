"use client";

import { Button, Flex, Input, Typography } from "@repo/ui";
import Link from "next/link";

/**
 * 顶部导航。按设计参照图 docs/openrouter.jpg 还原：logo · 搜索框 · 八项导航 · 实心注册按钮。
 *
 * 与上一版的两点差别：
 *   1. 去掉了 antd `Menu` —— 参照图里是朴素的 inline 链接，没有 Menu 那种下划线与选中态
 *   2. 导航从 4 项扩到 8 项（之前按公开资料调研时得到的项数不全，以截图为准）
 *
 * 只有 Models 指向真实页面 `/models`，其余七项**置灰且不可点** —— 点不动的占位比
 * 点进去 404 诚实。
 *
 * 标 "use client" 不是为了状态（这里没有），而是因为 antd 组件本身是客户端组件，
 * 而本文件用了 `Typography.Text` 这类**静态子组件** —— 服务端组件拿到的是引用代理，
 * 取不到静态成员。详见 app-shell.tsx 的注释。
 */

const NAV_LINKS = [
  { label: "Models", href: "/models" },
  { label: "Benchmarks", href: null },
  { label: "Chat", href: null },
  { label: "Rankings", href: null },
  { label: "Apps", href: null },
  { label: "Ori", href: null },
  { label: "Pricing", href: null },
  { label: "Docs", href: null },
];

export function AppHeader() {
  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid rgba(5, 5, 5, 0.06)",
        padding: "12px 24px",
      }}
    >
      <Flex align="center" gap={20}>
        {/* logo：紫色圆角方块 + 产品名。参照图里的方块是带白色图形的，这里用首字母近似。 */}
        <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "#7624f3",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            O
          </div>
          <Typography.Text strong style={{ fontSize: 17 }}>
            OpenRouter
          </Typography.Text>
        </Flex>

        {/*
          搜索框是**纯展示**：不接任何逻辑。参照图里它是全局搜索，接真搜索（跳 /models 并
          带查询参数）是独立的一步。参照图左侧还有个放大镜图标，本仓库的 UI 包没有引入
          图标库，故省略——这里不做自绘 SVG 的近似。
        */}
        <Input
          readOnly
          placeholder="Search"
          style={{ width: 220, flexShrink: 0 }}
          suffix={
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              ⌘ K
            </Typography.Text>
          }
        />

        {/* 导航推到右侧，与注册按钮相邻 —— 与参照图一致 */}
        <Flex align="center" gap={22} style={{ marginLeft: "auto" }}>
          {NAV_LINKS.map(({ label, href }) =>
            href ? (
              <Link key={label} href={href} style={{ color: "inherit" }}>
                <Typography.Text>{label}</Typography.Text>
              </Link>
            ) : (
              <Typography.Text
                key={label}
                type="secondary"
                title="尚未实现"
                style={{ cursor: "default" }}
              >
                {label}
              </Typography.Text>
            ),
          )}
          <Button type="primary">Sign Up</Button>
        </Flex>
      </Flex>
    </header>
  );
}
