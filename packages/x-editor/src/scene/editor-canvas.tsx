"use client";

import { OrbitControls, PerspectiveCamera, Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useRef, useState } from "react";
import type { RefObject } from "react";

import { ConcentricCircles } from "./concentric-circles";
import styles from "./editor-canvas.module.scss";

/** z-up 世界：`up` 与相机、控制器三者必须一致，否则轨道旋转会绕错轴。 */
const Z_UP: [number, number, number] = [0, 0, 1];

/** stats.js 的面板序号：0=FPS，1=MS，2=MB。一次只能显示一个。 */
const STATS_PANEL_FPS = 0;

/**
 * 3D 场景。结构照着参考实现（Bosch labelwise 的 `MainLidarView.tsx`）裁剪：
 * 一台透视相机 + 轨道控制器 + 一盏环境光 + 坐标轴 + 点云 + 左上角的帧率读数。
 *
 * 四个从参考实现学来的取舍，都不是随便定的：
 *
 * 1. **z-up 世界**（`up={[0,0,1]}`）。参考实现如此，因为它的正交相机只绕 z 旋转；
 *    而"z 轴朝上"也是该领域（激光雷达 / 自动驾驶标注）的通行约定。本编辑器将来要
 *    接的正交侧视图同样依赖这一点，所以从一开始就统一。
 * 2. **只有一盏 `<ambientLight intensity={1} />`**。点云用顶点色材质、不参与光照计算，
 *    所以不需要方向光/点光源；加多了只会白白增加着色开销。
 * 3. **`frameloop="always"`**。参考实现只给主视图用 `"always"`、副视图用 `"demand"`，
 *    理由是主视图交互频繁、`demand` 会让拖拽出现跳帧。这里只有一个视图，
 *    因此取 `"always"`。帧率读数也依赖这一点 —— `"demand"` 下静止时它读到的是假值。
 * 4. **帧率读数用 drei 的 `<Stats>`**（参考实现也是这个），见下面的说明。
 */
export function EditorCanvas({ showFps = true }: { showFps?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hostReady, setHostReady] = useState(false);

  /*
   * 用 **ref 回调**同时做两件事：把节点存进 hostRef、并在节点挂上后翻一次状态。
   *
   * 为什么不能像参考实现那样写 `{containerRef.current && <Stats … />}`：
   * 那在博世那边能用，是因为 `MainLidarView` 本身有大量 state，挂载后必然重渲染一次，
   * 那次重渲染正好让条件翻真。本组件几乎没有 state，条件永远不翻真，`<Stats>` 永不渲染。
   *
   * 为什么也不能用 `useEffect(() => setHostReady(true), [])`：
   * `react-hooks` 的 `recommended-latest` 里有一条规则会把它判为 error
   * （"Calling setState synchronously within an effect can trigger cascading renders"）。
   * 而 ref 回调里的 setState 是「外部系统（DOM）→ React」这个正当方向，
   * 也正是 React 文档推荐的「测量节点」写法。
   *
   * 为什么"翻一次状态"是必需的：drei 那个 effect 的依赖数组是
   * `[parent, stats, className, showPanel]`，而 `parent` 是个**稳定的 ref 对象** ——
   * 所以 `.current` 从 null 变成有值**不会**让 effect 重跑。若无条件渲染，
   * `stats.dom` 会在首次 effect 里被 append 到 `document.body`
   * （stats.js 在 parent 为空时的兜底），然后**永远留在那儿**。
   *
   * useCallback 的空依赖是必要的：ref 回调的标识一变，React 就会先解绑再重绑，
   * 那会在每次渲染时把状态来回翻。
   */
  const attachHost = useCallback((node: HTMLDivElement | null) => {
    hostRef.current = node;
    setHostReady(node !== null);
  }, []);

  return (
    <div className={styles.host} ref={attachHost}>
      <Canvas frameloop="always" gl={{ antialias: true }}>
        {/* attach="background" 把这台 color 挂到 scene.background 上，等价于给画布刷底色 */}
        <color attach="background" args={["#0b0b0f"]} />
        <PerspectiveCamera makeDefault position={[22, 22, 122]} up={Z_UP} />
        <OrbitControls makeDefault enableDamping={false} target={[0, 0, 0]} />
        <ambientLight intensity={1} />
        {/* 静态参照几何：坐标轴 + 地面上的距离环，放在点云之前 */}
        <axesHelper args={[5]} />
        <ConcentricCircles radiuses={[30, 50, 80, 100]} />
        <mesh position={[10, 10, 2]}>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color="#4287f5" />
        </mesh>
        {/*
          <Stats> 必须在 <Canvas> 内部 —— 它用的是 R3F 的 addEffect / addAfterEffect，
          那两个函数绑定在 R3F 的 store 上，放到 Canvas 外面会拿不到。

          它自身 return null：真正的工作是把 stats.js 的 DOM 面板 append 进 parent。
          样式只能通过 className 定制（stats.js 把其余样式写成内联 cssText），
          见 editor-canvas.module.scss 里为什么每一项都要 !important。
        */}
        {showFps && hostReady ? (
          <Stats
            className={styles.stats}
            showPanel={STATS_PANEL_FPS}
            /*
             * 一处必要的窄化：drei 声明 `parent?: RefObject<HTMLElement>`，
             * 也就是 `{ current: HTMLElement }`（非空）；而 React 19 的
             * `useRef<HTMLElement>(null)` 给出的是 `{ current: HTMLElement | null }`。
             * drei 自己的实现是判空的（`parent && parent.current || document.body`），
             * 是它的类型声明比实现严。这里顺着实现窄化一次，不去改上游 types。
             */
            parent={hostRef as RefObject<HTMLElement>}
          />
        ) : null}
      </Canvas>
    </div>
  );
}
