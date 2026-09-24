/**
 * 认证表单的校验规则。
 *
 * **刻意手写而不用 zod**：仓库里 zod 只住在 `@repo/x-typings`，那是跨包契约的地方；
 * 这里只是应用内的表单规则，没有第二个消费方。为一个邮箱正则把 zod 拉进应用的依赖不划算
 * （同一判据见 `features/models/model.ts` 为什么把 `Model` 留在应用内）。
 *
 * 规则在服务端执行（`actions.ts`）—— 那是安全边界，客户端的任何校验都只是体验优化。
 */

export type AuthMode = "signup" | "signin";

/** Server Action 的返回形状，配合 React 的 `useActionState` 使用。 */
export type AuthFormState = {
  error?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export const AUTH_ERROR = {
  emailRequired: "请输入邮箱地址",
  emailInvalid: "邮箱地址格式不正确",
  passwordTooShort: `密码至少需要 ${MIN_PASSWORD_LENGTH} 位`,
  termsRequired: "请先同意服务条款与隐私政策",
  credentialsInvalid: "邮箱或密码不正确",
} as const;

/** 邮箱与密码的通用规则。返回第一条不通过的规则，全部通过返回 null。 */
export function validateCredentials(input: {
  email: string;
  password: string;
}): string | null {
  const email = input.email.trim();

  if (!email) return AUTH_ERROR.emailRequired;
  if (!EMAIL_PATTERN.test(email)) return AUTH_ERROR.emailInvalid;
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return AUTH_ERROR.passwordTooShort;
  }

  return null;
}

/** 注册比登录多一条：必须勾选条款。 */
export function validateSignUp(input: {
  email: string;
  password: string;
  termsAccepted: boolean;
}): string | null {
  const credentialError = validateCredentials(input);
  if (credentialError) return credentialError;

  if (!input.termsAccepted) return AUTH_ERROR.termsRequired;

  return null;
}
