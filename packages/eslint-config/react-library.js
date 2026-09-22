import { baseConfig } from "./base.js";
import { reactConfig } from "./react.js";

/**
 * React 组件库配置。适用于被当作源码消费的包（package.json 的 exports 直指 .tsx），
 * 例如 packages/ui。
 *
 * 不含 Next.js 规则 —— 组件库不应该被应用的框架约束。
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const reactLibraryConfig = [...baseConfig, ...reactConfig];
