"use client";

import { Button, Card, Flex, Space, Typography } from "@repo/ui";

/**
 * 首页。按设计参照图 docs/openrouter.jpg 还原三个板块：Hero · 统计行 · 特性卡片。
 *
 * 为什么整个文件都是客户端组件：这里大量使用 `Typography.Title` / `Typography.Text`
 * 这类**静态子组件**。服务端组件从客户端组件模块拿到的是「引用代理」，代理上只有具名
 * 导出、没有静态成员，所以 `Typography.Title` 会是 undefined，构建期直接报
 * "Element type is invalid ... got: undefined"。
 * 详见 app-shell.tsx 与 app-header.tsx 的注释 —— 上一轮已经踩过一次。
 */

/**
 * ⚠️ 这四个数字是 **OpenRouter 官网自己的宣传数据**，照抄是为了版面还原。
 * **它们不是本项目的真实指标**，接真实数据前请勿当回事。
 * 与 model-catalog.ts 里那批演示数据同等对待。
 */
const STATS = [
  { value: "400T+", label: "Monthly Tokens" },
  { value: "10M+", label: "Global Users" },
  { value: "80+", label: "Providers" },
  { value: "500+", label: "Models" },
];

/** 卡片下方是仿厂商图标的色块，只是示意，不代表任何真实厂商 */
const PROVIDER_SWATCHES = [
  "#4285f4",
  "#10a37f",
  "#d97757",
  "#1a1a1a",
  "#f55036",
  "#ec4899",
  "#8b5cf6",
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#64748b",
  "#ef4444",
];

const FEATURES = [
  {
    title: "One API, every provider",
    description: "统一接入各家的模型，不用为每个厂商各写一套客户端。",
    art: <ProviderSwatchGrid />,
  },
  {
    title: "Automatic routing",
    description: "按可用性与价格自动挑选上游，单点故障时自动切换。",
    art: <RoutingDiagram />,
  },
  {
    title: "Live performance data",
    description: "吞吐与延迟实时可见，选型不用靠猜。",
    art: <ChartPlaceholders />,
  },
  {
    title: "No lock-in",
    description: "随时换模型、换厂商，业务代码不用动。",
    art: <Shield />,
  },
];

const ART_BOX: React.CSSProperties = {
  height: 190,
  background: "#fafafa",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

function ProviderSwatchGrid() {
  return (
    <div style={{ ...ART_BOX, padding: 16 }}>
      <Flex wrap justify="center" gap={10} style={{ maxWidth: 200 }}>
        {PROVIDER_SWATCHES.map((color) => (
          <div
            key={color}
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: color,
              opacity: 0.85,
            }}
          />
        ))}
      </Flex>
    </div>
  );
}

function RoutingDiagram() {
  return (
    <div style={{ ...ART_BOX, flexDirection: "column", gap: 0 }}>
      <div
        style={{
          padding: "6px 12px",
          background: "#fff",
          border: "1px solid rgba(5,5,5,0.1)",
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 12,
          color: "#444",
        }}
      >
        anthropic/claude-opus-5
      </div>
      {/* 用几条竖线示意「一个入口分叉到多个上游」 */}
      <div style={{ display: "flex", gap: 24, marginTop: 18 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{ width: 1, height: 34, background: "#d4d4d8" }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {["#1a1a1a", "#d97757", "#7c3aed"].map((color) => (
          <div
            key={color}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: color,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ChartPlaceholders() {
  return (
    <div style={{ ...ART_BOX, flexDirection: "column", gap: 10, padding: 16 }}>
      {["Throughput", "Latency"].map((label) => (
        <div
          key={label}
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid rgba(5,5,5,0.08)",
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            {label}
          </Typography.Text>
          {/* 不放真实曲线 —— 没有数据，画一条线就是伪造 */}
          <div
            style={{
              marginTop: 8,
              height: 1,
              background:
                "repeating-linear-gradient(90deg,#e4e4e7 0 6px,transparent 6px 12px)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function Shield() {
  return (
    <div style={{ ...ART_BOX, flexDirection: "column", gap: 12 }}>
      <div
        style={{
          width: 74,
          height: 84,
          background: "#fff",
          border: "2px solid #18181b",
          borderRadius: "50% 50% 46% 46% / 38% 38% 62% 62%",
        }}
      />
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "#d1fae5",
          color: "#059669",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          marginTop: -56,
        }}
      >
        ✓
      </div>
    </div>
  );
}

export function Landing() {
  return (
    <Flex vertical align="center">
      {/* ---------- Hero ---------- */}
      <Flex
        vertical
        align="center"
        gap={20}
        style={{ padding: "88px 24px 72px", maxWidth: 900, width: "100%" }}
      >
        <Typography.Title
          level={1}
          style={{
            fontSize: 68,
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            textAlign: "center",
            margin: 0,
            color: "#111",
          }}
        >
          The Unified Interface
          <br />
          For Every Model
        </Typography.Title>

        <Typography.Text style={{ fontSize: 17, color: "#444" }}>
          Better{" "}
          <span style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
            prices
          </span>
          , better{" "}
          <span style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
            uptime
          </span>
          , no subscriptions.
        </Typography.Text>

        <Space size={12} style={{ marginTop: 8 }}>
          <Button type="primary" size="large">
            Get API Key
          </Button>
          <Button size="large">Discover Models</Button>
        </Space>
      </Flex>

      {/* ---------- 统计行 ---------- */}
      <Flex
        justify="center"
        wrap
        gap={80}
        style={{ padding: "0 24px 72px", maxWidth: 1000, width: "100%" }}
      >
        {STATS.map(({ value, label }) => (
          <Flex key={label} vertical align="center" gap={2}>
            <Typography.Title
              level={2}
              style={{
                fontSize: 46,
                fontWeight: 700,
                margin: 0,
                color: "#111",
              }}
            >
              {value}
            </Typography.Title>
            <Typography.Text type="secondary">{label}</Typography.Text>
          </Flex>
        ))}
      </Flex>

      {/* ---------- 特性卡片 ---------- */}
      <Flex
        wrap
        justify="center"
        gap={16}
        style={{ padding: "0 24px 88px", maxWidth: 1180, width: "100%" }}
      >
        {FEATURES.map(({ title, description, art }) => (
          <Card
            key={title}
            style={{ width: 262 }}
            styles={{ body: { padding: 12 } }}
          >
            {art}
            <Flex vertical gap={4} style={{ padding: "12px 4px 4px" }}>
              <Typography.Text strong>{title}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                {description}
              </Typography.Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}
