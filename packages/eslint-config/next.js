import nextPlugin from "@next/eslint-plugin-next";

import { baseConfig } from "./base.js";
import { reactConfig } from "./react.js";

/**
 * Next.js 应用配置，适用于 apps/web。
 *
 * Next 规则只在这里出现，因此只有引入本入口的应用才会吃到它 ——
 * packages/ui 之类的库不会。
 *
 * @type {import("eslint").Linter.Config[]}
 */
// 用插件自带的 flat 预设，不要手工 plugins: { next: ... } ——
// Next 的规则名带命名空间（@next/next/*），插件必须以 "@next/next" 注册，
// 否则会报 "could not find plugin @next/next"。
const nextConfig = [
  nextPlugin.configs.recommended,
  nextPlugin.configs["core-web-vitals"],
];

export const nextJsConfig = [...baseConfig, ...reactConfig, ...nextConfig];
