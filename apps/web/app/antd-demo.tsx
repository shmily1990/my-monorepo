"use client";

import { Alert, App, Button, Flex, Space, Typography } from "@repo/ui";

/**
 * @repo/ui（antd 封装层）的试用区块。
 *
 * 组件全部从 @repo/ui 引入，应用不直接依赖 antd；主题与 locale 由 layout 里的
 * UiProvider 提供。message 用 App.useApp() 取，这样能拿到 ConfigProvider 的主题 ——
 * 直接 `import { message } from "antd"` 的静态方法做不到，React 19 下还会告警。
 */
export function AntdDemo() {
  const { message } = App.useApp();

  return (
    <Flex vertical gap={12} style={{ width: "100%", maxWidth: 480 }}>
      <Alert
        showIcon
        type="info"
        message="antd 已通过 @repo/ui 接入"
        description="主题与语言由 UiProvider 统一提供，应用不直接依赖 antd。"
      />
      <Space>
        <Button
          type="primary"
          onClick={() => message.success("来自 @repo/ui 的 Button")}
        >
          主要按钮
        </Button>
        <Button onClick={() => message.info("默认按钮")}>默认按钮</Button>
      </Space>
      <Typography.Text type="secondary">
        本区块由 apps/web/app/antd-demo.tsx 渲染，组件均来自 @repo/ui。
      </Typography.Text>
    </Flex>
  );
}
