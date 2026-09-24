import { notFound } from "next/navigation";

import { ApiKeyDetail } from "@/features/api-keys/detail";
import { findApiKey } from "@/features/api-keys/data/mock-api-keys";
import { verifySession } from "@/lib/auth/session";

/**
 * 路由 `/workspaces/api-keys/<id>` —— 某一把 key 的详情页，对应 docs/edit.jpg。
 *
 * Next 16 里 `params` 是 **Promise**，必须 `await`（`PageProps<...>` 这个全局类型由
 * `next typegen` 生成，而 `check-types` 会先跑它，所以路由段名是编译期校验过的）。
 *
 * 未知 id 直接 `notFound()`：给一个不存在的 key 渲染一个空壳表单，会让"没找到"和
 * "加载失败"看起来一样。
 */
export default async function Page({
  params,
}: PageProps<"/workspaces/api-keys/[id]">) {
  await verifySession();

  const { id } = await params;
  const apiKey = findApiKey(id);
  if (!apiKey) notFound();

  return <ApiKeyDetail apiKey={apiKey} />;
}
