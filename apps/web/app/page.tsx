import { Landing } from "./landing";

/**
 * 首页。按设计参照图 docs/openrouter.jpg 还原。
 *
 * 本文件是**服务端组件**，只做一件事：渲染客户端组件 Landing。
 * 三个板块为什么必须待在客户端组件里，见 landing.tsx 的注释。
 */
export default function Home() {
  return <Landing />;
}
