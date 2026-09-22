"use client";

import { Button as AntButton } from "antd";
import type { ComponentProps } from "react";

/**
 * antd Button 的项目包装。
 *
 * 目前是刻意的薄包装：原样透传 antd 的全部 props，不改变任何行为。它存在的意义是留一个
 * 统一的插入点 —— 将来要加默认尺寸、埋点、loading 规范或改主题，都改这里，而不是散落
 * 到各个应用里。
 *
 * props 类型取 ComponentProps 而不是 antd 导出的 ButtonProps，这样 ref 也能正确透传
 * （React 19 下 ref 是普通 prop）。
 */
export type ButtonProps = ComponentProps<typeof AntButton>;

export function Button(props: ButtonProps) {
  return <AntButton {...props} />;
}
