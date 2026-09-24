"use client";

import { Input } from "@repo/ui";
import { useEffect } from "react";

import { SearchIcon } from "@/components/icons";

import styles from "./header-search.module.scss";

/** 搜索框的 id，供 ⌘K 快捷键定位。用 id 而不是 ref，是为了不必从应用里引入 antd 的 ref 类型。 */
const SEARCH_INPUT_ID = "site-search";

/**
 * 吸顶导航中间的搜索框。
 *
 * 这是 header 里唯一需要成为客户端组件的地方 —— ⌘K 快捷键要挂 window 键盘事件。
 * header 其余部分（logo、导航链接）都是服务端组件。
 *
 * 键盘处理函数定义在 effect 内部，因此依赖数组只有那个常量 id：
 * `react-hooks/exhaustive-deps` 在这里是 warn，而 lint 跑 `--max-warnings 0`，
 * 把处理函数提到组件外层再引用会引入一个不必要的依赖项。
 */
export function HeaderSearch() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "k") return;

      const element = document.getElementById(SEARCH_INPUT_ID);
      if (element instanceof HTMLInputElement) {
        event.preventDefault();
        element.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={styles.wrapper}>
      {/*
        尺寸走 antd 自己的 size="large"（40px 高、圆角取自 token.borderRadius=8px），
        本模块只负责底色、边框与内边距。className 打在组件上，落到 affix wrapper 那一层，
        antd 6 的样式规则默认包在 :where() 里（特异性为 0），所以单类名就能覆盖，
        不需要 :global(.ant-input-...) 去猜 antd 的内部类名。
      */}
      <Input
        id={SEARCH_INPUT_ID}
        className={styles.input}
        size="large"
        prefix={<SearchIcon size={16} />}
        suffix={<span className={styles.kbd}>⌘ K</span>}
        placeholder="Search"
        aria-label="搜索模型"
      />
    </div>
  );
}
