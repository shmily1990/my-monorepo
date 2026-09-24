"use client";

import type { ReactNode } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { ObjectList } from "../panels/object-list";
import { Viewer2D } from "../panels/viewer-2d";
import { Viewer3D } from "../panels/viewer-3d";
import { EditorHeader } from "./editor-header";
import { EditorPanel } from "./editor-panel";
import styles from "./editor-shell.module.scss";

/**
 * 编辑器整体骨架：顶栏 + 三列（左 2D / 中 3D / 右列表），列间两条可拖拽分隔条。
 * 对应 `docs/editor-core.jpg` 的布局（底部的帧回放条本次不做，已确认）。
 *
 * 分隔条用 `react-resizable-panels`（参考实现也用这个库）。注意它是 **v4**，
 * 而网上多数示例还是 v3 的写法 —— `Group`（不是 `PanelGroup`）、
 * `Separator`（不是 `PanelResizeHandle`）、`orientation`（不是 `direction`）。
 *
 * 尺寸语义（读 `.d.ts` 确认）：**数字当像素、不带单位的字符串当百分比**。
 * 这里一律写带 `%` 的字符串，免得以后有人把 `25` 改成 `25`（本意是百分比）时
 * 静默变成 25px。
 *
 * 三列与两条分隔条**始终渲染**：哪一列有内容由 `EditorPanel` 按 loader 声明的
 * `kind` 决定，而不是靠增删列。
 */
export function EditorShell({
  logo,
  title,
  showFps,
  onSave,
  saving,
}: {
  logo?: ReactNode;
  title: string;
  /** 透传给 3D 面板的帧率读数开关，见 XEditorCoreProps.showFps */
  showFps?: boolean;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <div className={styles.shell}>
      <EditorHeader logo={logo} title={title} onSave={onSave} saving={saving} />

      <Group orientation="horizontal" className={styles.body}>
        <Panel className={styles.column} defaultSize="25%" minSize="12%">
          <EditorPanel title="2D" dimension="2d">
            <Viewer2D />
          </EditorPanel>
        </Panel>

        <Separator className={styles.separator} />

        <Panel className={styles.column} defaultSize="63%" minSize="20%">
          <EditorPanel title="3D" dimension="3d">
            <Viewer3D showFps={showFps} />
          </EditorPanel>
        </Panel>

        <Separator className={styles.separator} />

        {/* 右列是跨维度的列表，与 2D/3D 无关，所以不传 dimension */}
        <Panel className={styles.column} defaultSize="12%" minSize="12%">
          <EditorPanel title="列表">
            <ObjectList />
          </EditorPanel>
        </Panel>
      </Group>
    </div>
  );
}
