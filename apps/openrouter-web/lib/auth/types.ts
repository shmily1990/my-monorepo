/**
 * 会话里的用户。
 *
 * 刻意留在应用内，**不进 `@repo/x-typings`** —— 判据同 `features/models/model.ts`：
 * 只有一个包需要它、没有任何运行时校验、也没有第二个消费方。
 * `packages/x-typings` 里那个 `UserSchema` 要求 uuid 的 `id` 与可选的 `age`，
 * 是脚手架留下的示例，不是这里的契约。
 *
 * 升级触发点：当真正的后端开始返回这个形状、或者第二个包要引用它时，
 * 再提升为 `packages/x-typings/src/session.ts`（Zod schema + z.infer）。
 */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
};
