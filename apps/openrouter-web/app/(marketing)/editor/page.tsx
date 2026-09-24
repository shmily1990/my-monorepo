import { EditorPage } from "@/features/editor";

/**
 * 路由 `/editor`。
 *
 * 与其他路由文件一样只做路径到 feature 组件的映射，页面结构在 `features/editor` 里。
 * 这一页是全屏不滚动的编辑器外壳（高度算法见 features/editor/index.module.scss）。
 */
export default function Page() {
  return <EditorPage />;
}
