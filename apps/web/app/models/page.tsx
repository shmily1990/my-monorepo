import { models } from "./model-catalog";
import { ModelExplorer } from "./model-explorer";

/**
 * 模型目录页（`/models`）。从首页的导航进入。
 *
 * 本文件是**服务端组件**：数据在这里拿到，交互交给客户端组件。
 * 将来换成真实接口时，把 `models` 的来源换成 fetch 即可，页面结构不用动。
 */
export default function ModelsPage() {
  return <ModelExplorer models={models} />;
}
