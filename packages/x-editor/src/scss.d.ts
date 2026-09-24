/*
 * 让 `import styles from "./x.module.scss"` 在本包内类型可用。
 *
 * 为什么本包要自己声明：那条 `declare module "*.module.scss"` 出现在
 * `next/types/global.d.ts` 里，只对 **Next 应用的编译环境** 生效 —— 它通过
 * `next-env.d.ts` 的 `/// <reference types="next" />` 被引入。本包 extend 的是
 * `react-library.json`，看不到那份声明，于是 `.scss` 导入会报 TS2307
 * "Cannot find module"。这一份声明把那个缺口补上，而且不引入对 Next 的依赖 ——
 * 这正是「样式由消费方的打包器编译」这个源码消费模型该有的样子。
 *
 * 类型只能是 `{ readonly [key: string]: string }`：CSS Modules 的类名在编译期才生成，
 * TypeScript 无从校验。所以 `styles.foo` 写错了**不会**报错，只会静默无样式 ——
 * 与本仓库应用侧的 `.module.scss` 是同一个众所周知的坑。
 */
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.scss" {}
