/**
 * 拼接 className，滤掉假值。
 *
 * 存在的理由：CSS Module 的 `styles.foo` 类型是 `string`（见 next/types/global.d.ts 里
 * `*.module.scss` 的声明），所以条件类名只能靠字符串拼接，没有任何类型保护 ——
 * `[styles.a, cond && styles.b].filter(Boolean).join(" ")` 这个模式值得只写一次。
 *
 * 刻意不引 clsx / classnames：两个依赖解决一个五行函数，不划算。
 */
export function cn(
  ...values: readonly (string | false | null | undefined)[]
): string {
  return values.filter(Boolean).join(" ");
}
