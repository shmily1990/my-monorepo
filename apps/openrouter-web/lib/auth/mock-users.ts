import type { AuthUser } from "./types";

/**
 * mock 用户表 —— **含明文密码**。
 *
 * 所以这个模块只允许被服务端代码引用（`lib/auth/session.ts`、
 * `features/auth/actions.ts`）。任何客户端组件 import 它，整张表连同密码都会被打进
 * client bundle。登录表单里那行"测试账号"提示因此写成字面量，
 * 见 features/auth/components/sign-in-form/index.tsx，并在注释里指回这里。
 */

export type MockUser = AuthUser & {
  password: string;
};

export const MOCK_USERS: readonly MockUser[] = [
  {
    id: "u_617168805",
    name: "xiao mingliang",
    email: "617168805@qq.com",
    password: "openrouter",
  },
  {
    id: "u_demo",
    name: "Demo User",
    email: "demo@openrouter.ai",
    password: "demo1234",
  },
];

/** 邮箱比对不区分大小写，密码区分。 */
export function findMockUser(email: string, password: string): MockUser | null {
  const needle = email.trim().toLowerCase();

  return (
    MOCK_USERS.find(
      (user) =>
        user.email.toLowerCase() === needle && user.password === password,
    ) ?? null
  );
}

/** OAuth 按钮在 mock 下直接登录的那个用户。 */
export const OAUTH_FALLBACK_USER: MockUser = {
  id: "u_oauth",
  name: "Demo User",
  email: "demo@openrouter.ai",
  password: "",
};
