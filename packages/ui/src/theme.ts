import type { ThemeConfig } from "antd";

/**
 * 全局主题，所有子应用共用这一份。
 *
 * token 留空即等同 antd 默认值。要换品牌色就在这里加（例如 token.colorPrimary），
 * 这是整个仓库唯一的主题入口 —— 不要在应用里各写各的 ConfigProvider theme。
 */
export const theme: ThemeConfig = {
  token: {},
};
