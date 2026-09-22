"use client";

import {
  Alert,
  Card,
  Checkbox,
  Empty,
  Flex,
  Input,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "@repo/ui";
import { useMemo, useState } from "react";

import type { Model, ModelTag } from "./model-catalog";

/**
 * 模型目录页的主体。本仓库里唯一有状态的组件，因此标 "use client"。
 *
 * 数据由 page.tsx（服务端组件）传进来，这里只负责交互与呈现——App Router 的标准分工。
 *
 * 注意：列定义直接写在 JSX 里而不是抽成常量，是为了让 TS 从 Table 的 props 上下文
 * 推断出列类型。若抽出去单独声明，就需要显式标注 antd 的 ColumnsType，而那个类型只能从
 * `antd` 深路径导入——本仓库禁止应用直接依赖 antd（import/no-extraneous-dependencies 会拦）。
 */

const TAG_COLORS: Record<ModelTag, string> = {
  Free: "green",
  Tools: "blue",
  Vision: "purple",
  Reasoning: "orange",
  "Long context": "cyan",
};

function formatPrice(perMillion: number) {
  return perMillion === 0 ? "免费" : `$${perMillion.toFixed(2)}`;
}

function formatContext(tokens: number) {
  return tokens >= 1_000_000
    ? `${(tokens / 1_000_000).toFixed(1)}M`
    : `${Math.round(tokens / 1000)}K`;
}

function tagList(tags: ModelTag[]) {
  return (
    <Space size={4} wrap>
      {tags.map((tag) => (
        <Tag key={tag} color={TAG_COLORS[tag]}>
          {tag}
        </Tag>
      ))}
    </Space>
  );
}

type SortKey = "name" | "price-asc" | "price-desc" | "context-desc";

const SORT_OPTIONS = [
  { value: "name", label: "按名称" },
  { value: "price-asc", label: "价格从低到高" },
  { value: "price-desc", label: "价格从高到低" },
  { value: "context-desc", label: "上下文从大到小" },
];

export function ModelExplorer({ models }: { models: Model[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<"table" | "cards">("table");
  const [freeOnly, setFreeOnly] = useState(false);
  const [toolsOnly, setToolsOnly] = useState(false);

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    const filtered = models.filter((model) => {
      if (freeOnly && !model.tags.includes("Free")) return false;
      if (toolsOnly && !model.tags.includes("Tools")) return false;
      if (!keyword) return true;
      return (
        model.name.toLowerCase().includes(keyword) ||
        model.provider.toLowerCase().includes(keyword) ||
        model.id.includes(keyword)
      );
    });

    // 用 sort 而不是 toSorted：toSorted 属 ES2023，而共享的 base.json 里 lib 是 es2022，
    // 用它会报 TS2550。`filtered` 是上面 filter 刚生成的新数组，原地排序不会影响入参。
    return filtered.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.promptPricePerM - b.promptPricePerM;
        case "price-desc":
          return b.promptPricePerM - a.promptPricePerM;
        case "context-desc":
          return b.contextLength - a.contextLength;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [models, query, sort, freeOnly, toolsOnly]);

  return (
    <Flex vertical gap={16} style={{ padding: 24 }}>
      <div>
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          Models
        </Typography.Title>
        <Typography.Text type="secondary">
          {visible.length} / {models.length} 个模型
        </Typography.Text>
      </div>

      <Alert
        type="info"
        showIcon
        message="演示数据"
        description="下面的模型名称与价格是为搭页面而编的示意值，不是任何厂商的真实报价。页面尚未接入接口。"
      />

      <Flex wrap gap={12} align="center">
        <Input.Search
          allowClear
          placeholder="搜索模型或厂商"
          style={{ width: 260 }}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select
          style={{ width: 180 }}
          value={sort}
          options={SORT_OPTIONS}
          onChange={(value) => setSort(value)}
        />
        <Segmented
          value={view}
          onChange={(value) => setView(value as "table" | "cards")}
          options={[
            { value: "table", label: "表格" },
            { value: "cards", label: "卡片" },
          ]}
        />
        <Checkbox
          checked={freeOnly}
          onChange={(event) => setFreeOnly(event.target.checked)}
        >
          只看免费
        </Checkbox>
        <Checkbox
          checked={toolsOnly}
          onChange={(event) => setToolsOnly(event.target.checked)}
        >
          支持工具调用
        </Checkbox>
      </Flex>

      {visible.length === 0 ? (
        <Empty description="没有符合条件的模型" />
      ) : view === "table" ? (
        <Table<Model>
          rowKey="id"
          dataSource={visible}
          pagination={false}
          size="middle"
          columns={[
            {
              title: "模型",
              dataIndex: "name",
              render: (_value, row) => (
                <Flex vertical>
                  <Typography.Text strong>{row.name}</Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {row.id}
                  </Typography.Text>
                </Flex>
              ),
            },
            {
              title: "上下文",
              dataIndex: "contextLength",
              align: "right",
              render: (_value, row) => formatContext(row.contextLength),
            },
            {
              title: (
                <Tooltip title="每百万输入 token 的美元价">
                  <span>输入 / 1M</span>
                </Tooltip>
              ),
              dataIndex: "promptPricePerM",
              align: "right",
              render: (_value, row) => formatPrice(row.promptPricePerM),
            },
            {
              title: (
                <Tooltip title="每百万输出 token 的美元价">
                  <span>输出 / 1M</span>
                </Tooltip>
              ),
              dataIndex: "completionPricePerM",
              align: "right",
              render: (_value, row) => formatPrice(row.completionPricePerM),
            },
            {
              title: "能力",
              dataIndex: "tags",
              render: (_value, row) => tagList(row.tags),
            },
          ]}
        />
      ) : (
        <Flex wrap gap={12}>
          {visible.map((model) => (
            <Card
              key={model.id}
              title={model.name}
              extra={
                <Typography.Text type="secondary">
                  {model.provider}
                </Typography.Text>
              }
              style={{ width: 300 }}
            >
              <Flex vertical gap={8}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {model.id}
                </Typography.Text>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">上下文</Typography.Text>
                  <Typography.Text>
                    {formatContext(model.contextLength)}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">输入 / 1M</Typography.Text>
                  <Typography.Text>
                    {formatPrice(model.promptPricePerM)}
                  </Typography.Text>
                </Flex>
                <Flex justify="space-between">
                  <Typography.Text type="secondary">输出 / 1M</Typography.Text>
                  <Typography.Text>
                    {formatPrice(model.completionPricePerM)}
                  </Typography.Text>
                </Flex>
                {tagList(model.tags)}
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
