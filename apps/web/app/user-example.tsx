import { UserSchema, type User } from "@repo/x-typings";

// @repo/x-typings 的接线示例，同时覆盖两条路径：
//   编译期 —— `type User` 来自 z.infer，证明类型能被消费方解析
//   运行期 —— `UserSchema` 带 zod 运行时，证明打包器会转译 workspace 源码并带上依赖
// 这只是为了验证接线，接入真实业务后连同 page.tsx 里的引用一起删除即可。
const rawUser: unknown = {
  id: "3f1a2b4c-5d6e-4f70-8a91-b2c3d4e5f607",
  name: "Ada Lovelace",
  email: "ada@example.com",
};

export function UserExample() {
  const result = UserSchema.safeParse(rawUser);

  if (!result.success) {
    return <p>共享类型示例：数据校验未通过</p>;
  }

  const user: User = result.data;
  user.age = 36; // TS类型推断正常，说明类型能被消费方解析

  return (
    <p>
      共享类型示例：{user.name}（{user.email}）
    </p>
  );
}
