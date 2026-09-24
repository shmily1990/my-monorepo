"use client";

import type { EditorPoint } from "@repo/x-typings";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

/** 按高度着色的两端颜色（低 → 高）。 */
const LOW_COLOR = new THREE.Color("#35507a");
const HIGH_COLOR = new THREE.Color("#7fd4ff");

/**
 * 点云。把 `EditorPoint[]` 构建成一条 `BufferGeometry` 交给 `<points>`。
 *
 * 两个要点：
 *
 * 1. **顶点色**：颜色按 z 高度归一化后插值。这样静态点云也有可读的空间层次，
 *    而且完全确定性 —— 不依赖时间、随机数或运行环境，不会造成 hydration 差异。
 *    真实实现里颜色该由强度 / 类别（参考实现用的是 16 色的调色板 + 样条映射）决定，
 *    那是接入真实数据时的事。
 *
 * 2. **`dispose()`**：几何体持有 GPU 侧缓冲，不受 GC 管理。**卸载时不释放就是泄漏** ——
 *    反复切换编辑器页面会把显存吃光。这是 3D 代码里最常被漏掉的一处，
 *    所以在 `useEffect` 的清理函数里显式释放。
 */
export function PointCloud({ points }: { points: readonly EditorPoint[] }) {
  const geometry = useMemo(() => {
    const count = points.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // 先扫一遍求 z 的范围，否则没法把高度归一化到 0..1
    let minZ = Number.POSITIVE_INFINITY;
    let maxZ = Number.NEGATIVE_INFINITY;
    for (const point of points) {
      if (point.z < minZ) minZ = point.z;
      if (point.z > maxZ) maxZ = point.z;
    }
    // 所有点同高时 span 为 0，退化成 1 以免除零
    const span = maxZ - minZ || 1;

    const color = new THREE.Color();

    points.forEach((point, index) => {
      const at = index * 3;

      positions[at] = point.x;
      positions[at + 1] = point.y;
      positions[at + 2] = point.z;

      color.copy(LOW_COLOR).lerp(HIGH_COLOR, (point.z - minZ) / span);
      colors[at] = color.r;
      colors[at + 1] = color.g;
      colors[at + 2] = color.b;
    });

    const built = new THREE.BufferGeometry();
    built.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    built.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    // 供视锥剔除与相机 fit 使用；不算的话 three 会在第一次渲染时懒算
    built.computeBoundingSphere();

    return built;
  }, [points]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <points geometry={geometry}>
      {/*
        vertexColors 让材质取用几何体上的 color 属性；
        sizeAttenuation 让远处的点自然变小（关掉的话远近一样大，看着像贴纸）。
      */}
      <pointsMaterial size={0.35} sizeAttenuation vertexColors />
    </points>
  );
}
