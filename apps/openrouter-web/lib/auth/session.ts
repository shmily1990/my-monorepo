import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import type { AuthUser } from "./types";

/*
 * 会话 cookie 的读写。
 *
 * ⚠️ **mock 的边界：cookie 的值只是 base64url 的 JSON，没有签名。**
 * 任何人手动改一下 cookie 就能冒充任意用户。真实实现必须按 Next 官方 auth 指南
 * 用 jose / iron-session 把会话签名（或加密）后再放进 cookie —— 那正是这个文件
 * 该改的地方，所有调用方都不用动。不要把这里的模式带进真实项目。
 *
 * cookie 是 httpOnly 的：会话只在服务端读（SiteHeader 是服务端组件），客户端从不碰它。
 * 这是"接受动态渲染"换来的好处 —— 若改走客户端读 cookie 的方案，就必须去掉 httpOnly。
 *
 * 读 cookie 会让路由变成动态渲染（Next 16 的既定行为，`cacheComponents` 未开启时无解），
 * 所以 `/` 与 `/models` 从预渲染静态变成了每次请求 SSR。
 */

export const SESSION_COOKIE = "or_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * 用 Buffer 而不是 btoa/atob：后者只处理 Latin-1，用户注册时填中文名会直接抛错。
 * 这个模块只在服务端跑（它 import 了 next/headers），Buffer 一定可用。
 */
function encode(user: AuthUser): string {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

/** 解析失败一律当作「没有会话」，不抛错 —— cookie 是用户可改的输入。 */
function decode(value: string): AuthUser | null {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );

    if (typeof parsed !== "object" || parsed === null) return null;

    const { id, name, email } = parsed as Record<string, unknown>;
    if (
      typeof id !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string"
    ) {
      return null;
    }

    return { id, name, email };
  } catch {
    return null;
  }
}

/**
 * 读当前会话，未登录返回 null。
 *
 * `cache()` 去重是**必需的，不是优化**：一次请求里 `(dashboard)/layout`、
 * workspaces 页与 `SiteHeader` 都会调它，不加就是同一份 cookie 读三次。
 */
export const getSession = cache(async (): Promise<AuthUser | null> => {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;

  if (!raw) return null;
  return decode(raw);
});

/**
 * 已登录则返回用户，未登录则跳回首页。
 *
 * 内部复用 `getSession()` 而不是自己再 `await cookies()` —— 否则两个 `cache()`
 * 各缓存一份，cookie 还是会被读两次，去重就白做了。
 *
 * 跳 `"/"` 而不是 `"/login"`：登录是弹框，没有登录页，所以没有可跳的登录 URL。
 * 落到首页后右上角就是 Sign Up 按钮。
 */
export const verifySession = cache(async (): Promise<AuthUser> => {
  const user = await getSession();
  if (!user) redirect("/");

  return user;
});

/**
 * 写会话。**只能在 Server Action 或 Route Handler 里调用** ——
 * `cookies().set()` 在组件渲染期是不允许的（HTTP 不允许在流开始后写头）。
 */
export async function createSession(user: AuthUser): Promise<void> {
  const store = await cookies();

  store.set(SESSION_COOKIE, encode(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    /*
     * `secure` 固定为 false，**不能**写成 `process.env.NODE_ENV === "production"`：
     * 这个仓库没有在 turbo.json 里声明 `globalEnv`，而 `turbo/no-undeclared-env-vars`
     * 是 error —— 任何 `process.env.X` 都会让 `pnpm lint`（--max-warnings 0）直接失败。
     * 真实部署请改成 true（那也是换成签名会话时该一起改的地方）。
     */
    secure: false,
  });
}

/** 清会话。同样只能在 Server Action 或 Route Handler 里调用。 */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
