import { HomePage } from "@/features/home";

/**
 * 路由 `/`。
 *
 * 路由文件只做一件事：把路径映射到 feature 组件。页面结构与业务组件都在
 * features/home 里，这里不写任何 UI。header / footer 由 (marketing)/layout.tsx 提供。
 */
export default function Page() {
  return <HomePage />;
}
