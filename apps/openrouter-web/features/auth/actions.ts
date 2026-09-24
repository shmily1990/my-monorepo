"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { OAUTH_FALLBACK_USER, findMockUser } from "@/lib/auth/mock-users";
import { createSession, destroySession } from "@/lib/auth/session";

import { AUTH_ERROR, validateCredentials, validateSignUp } from "./data/form";
import type { AuthFormState } from "./data/form";

/*
 * 认证的 Server Actions。
 *
 * 文件级 `"use server"` 是**必需**的：客户端表单要 import 这些函数，而只有文件级指令
 * 才允许从客户端组件引用服务端函数。
 *
 * ⚠️ **这是 mock**：不接后端，校验做完之后只查一张写死的用户表。真实实现替换这一个文件
 * 即可，调用方（两个表单、用户菜单、OAuth 按钮）都不用动。
 *
 * 几条容易踩的规则：
 *   1. `redirect()` 抛的是**控制流异常**，所以它是每个成功分支的最后一句，
 *      而且**不能被 try/catch 包住** —— catch 会把跳转吞掉。
 *   2. `revalidatePath("/", "layout")` 必须排在 `redirect()` **之前**（因为 redirect 抛异常，
 *      排在它后面就永远不会执行）。它不是可选项：共享 layout 段会被客户端路由器缓存，
 *      不在导航时重新取 —— 少了这一句，在 /models 登录后再回到 /models 可能拿到缓存的、
 *      仍然显示未登录状态的 header。
 *   3. `cookies().set()` 只能在 Server Action / Route Handler 里调用，渲染期不行。
 *   4. 官方指南要求 Server Action 自己校验身份，不能只依赖路由守卫。
 *      这里四个 action 都**不需要**：三个是登录前的前置动作，`signOut` 销毁会话本身幂等。
 *   5. **写入会话之后不要再调 `getSession()`** —— 它是 `cache()` 过的，同一次执行里
 *      会返回写入前的旧值。用刚构造出来的 user 对象即可。
 */

export async function signInAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const fieldError = validateCredentials({ email, password });
  if (fieldError) return { error: fieldError };

  const user = findMockUser(email, password);
  if (!user) return { error: AUTH_ERROR.credentialsInvalid };

  await createSession({ id: user.id, name: user.name, email: user.email });
  revalidatePath("/", "layout");
  redirect("/workspaces");
}

export async function signUpAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const termsAccepted = formData.get("terms") === "on";

  const fieldError = validateSignUp({ email, password, termsAccepted });
  if (fieldError) return { error: fieldError };

  // 姓名都留空时回退到邮箱 @ 前面那段，否则身份块会出现一个空标题
  const name =
    [firstName, lastName].filter(Boolean).join(" ") ||
    email.split("@")[0] ||
    email;

  /*
   * 不往 mock 用户表里写：那张表在内存里，dev server 一重启就没了。
   * 新用户直接序列化进 cookie，所以刷新、重启之后依然登录着。
   */
  await createSession({ id: crypto.randomUUID(), name, email });
  revalidatePath("/", "layout");
  redirect("/workspaces");
}

/**
 * 三个 OAuth 按钮的 mock 实现：直接以 demo 用户建立会话。
 *
 * 这样按钮是**有真实行为**的，而不是点了没反应的装饰。
 * 每个按钮是独立的 `<form>`，provider 通过隐藏字段提交 —— 用 form action 而不是
 * `bind`，是为了不依赖服务端函数绑定的行为，也让调用点保持最普通的形式。
 *
 * 参数里那个 `provider` 隐藏字段在 mock 下确实用不上，所以这里连读都不读
 * （下划线前缀让 `no-unused-vars` 放行 —— 注意它只对**函数参数**生效，
 * 对局部变量无效，所以不能写成 `const _provider = …`）。
 * 真实实现接手时它就是发起授权跳转的依据，届时只需改这个函数体，调用点一行都不用动。
 */
export async function oauthAction(_formData: FormData): Promise<void> {
  await createSession({
    id: OAUTH_FALLBACK_USER.id,
    name: OAUTH_FALLBACK_USER.name,
    email: OAUTH_FALLBACK_USER.email,
  });
  revalidatePath("/", "layout");
  redirect("/workspaces");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}
