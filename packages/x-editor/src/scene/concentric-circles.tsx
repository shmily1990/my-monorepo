"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

/** 每个圆的最少段数。半径越大段数越多，否则大圆会看出多边形棱角。 */
const MIN_SEGMENTS = 96;

/** 每单位半径增加多少段 —— 96 段够半径 64 以内看不出棱角。 */
const SEGMENTS_PER_UNIT = 1.5;

/**
 * 把半径展开成一圈顶点。
 *
 * **不重复首点**：`<lineLoop>` 会自动把最后一个点接回第一个。
 * 顶点落在 **XY 平面、z = 0** —— z-up 世界里这就是地面，也正是参考图里
 * 那些环呈椭圆（从高处看地面的透视结果）而不是正圆的原因。
 */
function buildRingGeometry(radius: number): THREE.BufferGeometry {
  const segments = Math.max(
    MIN_SEGMENTS,
    Math.ceil(radius * SEGMENTS_PER_UNIT),
  );
  const positions = new Float32Array(segments * 3);

  for (let index = 0; index < segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const at = index * 3;

    positions[at] = Math.cos(angle) * radius;
    positions[at + 1] = Math.sin(angle) * radius;
    positions[at + 2] = 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  // 供视锥剔除使用；不算的话 three 会在第一次渲染时懒算
  geometry.computeBoundingSphere();

  return geometry;
}

function Ring({
  radius,
  color,
  opacity,
}: {
  radius: number;
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => buildRingGeometry(radius), [radius]);

  // 几何体占着 GPU 缓冲、不受 GC 管理 —— 卸载不释放就是泄漏。
  // 与 scene/point-cloud.tsx 同一个理由、同一个写法。
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineLoop geometry={geometry}>
      {/*
        transparent 让 three 把它排在不透明物体（点云）之后渲染；
        默认的 depthTest 仍然生效，所以遮挡关系是对的。
        lineWidth 这里不设 —— WebGL 下它基本被忽略（只有 1px 有效），
        而参考图里那些环本来就是细而淡的。
      */}
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineLoop>
  );
}

/**
 * 以坐标原点为中心的一圈圈距离环，给场景一个尺度参照。
 *
 * 参考项目（Bosch labelwise）有同名组件与同名 prop，但那个文件是空的 ——
 * 只有调用点是真实的：`<ConcentricCircles radiuses={[30, 50, 80, 100]} />`。
 * 所以 prop 名保持 `radiuses`（语法上 "radii" 更好，但与既有调用点一致更重要）。
 *
 * ⚠️ 画线**不要**用 `<line>` —— R3F 会把 three 的导出名首字母小写映射成 JSX 元素，
 * 但 `line` 与 `path` 因为和 SVG 标签撞名被改名成了 `threeLine` / `threePath`。
 * 写 `<line>` 拿到的是 SVG 的 line，不是 three 的 Line。这里用 `<lineLoop>` 不受影响。
 */
export function ConcentricCircles({
  radiuses,
  color = "#6b6b78",
  opacity = 0.35,
}: {
  /** 各圈半径，单位与世界坐标一致 */
  radiuses: readonly number[];
  color?: string;
  opacity?: number;
}) {
  return (
    <>
      {radiuses.map((radius) => (
        <Ring key={radius} radius={radius} color={color} opacity={opacity} />
      ))}
    </>
  );
}
