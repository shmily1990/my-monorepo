import { ModelsPage } from "@/features/models";

/**
 * 路由 `/models`。
 *
 * 与首页一样，路由文件只做路径到 feature 组件的映射，页面结构在 features/models 里。
 * 这里保持服务端组件 —— ModelsPage 是客户端组件（它持有全部筛选状态），
 * 服务端组件渲染客户端组件拿到的是 client reference，这是合法且推荐的写法。
 */
export default function Page() {
  return <ModelsPage />;
}
