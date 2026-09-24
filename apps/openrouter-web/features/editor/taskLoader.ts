import type {
  EditorDataKind,
  EditorDataset,
  EditorDataLoader,
} from "@repo/x-typings";

/*
 * 编辑器数据加载器。
 *
 * 这是**应用按 @repo/x-typings 的契约实现、编辑器消费**那一侧：
 * 契约（`EditorDataLoader`）在 x-typings，实现在这里，`@repo/x-editor` 只认契约。
 * 所以 x-editor 不需要知道数据从哪来，换一个后端只改这个文件。
 */

export class BaseDataLoader {
  protected projectName: string;

  constructor(projectName: string) {
    this.projectName = projectName;
  }

  async init() {
    // 真实实现：初始化 SDK / 鉴权 / 预取规则配置
  }

  async loadRuleConfig() {
    // 真实实现：拉取该项目的标注规则配置
  }

  getRuleConfig() {
    // 真实实现：返回已加载的规则配置
  }
}

/**
 * 验收任务的数据加载器。
 *
 * ⚠️ **名字里的 `Accptance` 是拼写错误**（应为 `Acceptance`），保留原样是因为它已在
 * 三处被引用；改名是独立的一次改动，不该混在这里。
 */
export class AccptanceDataLoader
  extends BaseDataLoader
  implements EditorDataLoader
{
  /**
   * 本数据源同时有 2D 与 3D。
   *
   * 这个字段是**同步**的，因为编辑器要在首屏就据此决定左中两列渲染内容还是占位 ——
   * 等 `loadDataset()` 回来再决定会让布局跳一下。
   */
  readonly kind: EditorDataKind = "both";

  async init() {
    await super.init();
  }

  async loadDataset(): Promise<EditorDataset> {
    return buildSampleDataset();
  }
}

/*
 * 样例数据。
 *
 * **必须是确定性的** —— 不能出现 `Math.random()` / `Date.now()` / `new Date()`。
 * 理由与本仓库 `lib/utils/format.ts`、`features/models/data/filters.ts` 避开
 * `toLocaleDateString` / `localeCompare` 是同一条：服务端与客户端各算一次，
 * 任何依赖环境或时间的结果都会导致 hydration mismatch。
 *
 * 点云排成一个绕 z 轴螺旋上升的环 —— 这样点云在三视图里都能看出立体结构，
 * 比随机撒点更容易判断相机初始位置对不对。
 */

/** 螺旋点云：沿 z 轴上升的同时绕圈，半径带一点确定性起伏。 */
function buildSpiralPoints(count: number): EditorDataset["points"] {
  const points: EditorDataset["points"] = [];

  for (let index = 0; index < count; index += 1) {
    // [0, 1) 的确定性比例，不用随机数
    const t = index / count;
    const angle = t * Math.PI * 2 * 6; // 绕 6 圈
    const radius = 6 + 2 * Math.sin(t * Math.PI * 4);

    points.push({
      x: Number((radius * Math.cos(angle)).toFixed(3)),
      y: Number((radius * Math.sin(angle)).toFixed(3)),
      z: Number((t * 24 - 12).toFixed(3)), // -12 到 +12，让高度着色看得出渐变
    });
  }

  return points;
}

function buildSampleDataset(): EditorDataset {
  return {
    kind: "both",
    points: buildSpiralPoints(4000),
    frames2d: [
      { id: "front", label: "FrontCam 前视", imageUrl: "/sample/front.jpg" },
      { id: "left", label: "LeftCam 左视", imageUrl: "/sample/left.jpg" },
      { id: "right", label: "RightCam 右视", imageUrl: "/sample/right.jpg" },
    ],
    items: [
      { id: "obj-1", label: "作业区 01", kind: "3d" },
      { id: "obj-2", label: "作业区 02", kind: "3d" },
      { id: "obj-3", label: "运输车 01", kind: "3d" },
      { id: "obj-4", label: "前视路面标记", kind: "2d" },
      { id: "obj-5", label: "左视车道线", kind: "2d" },
      { id: "obj-6", label: "右视井盖", kind: "2d" },
    ],
  };
}
