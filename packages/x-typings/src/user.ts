import { z } from "zod";

// 1. 定义zod校验schema（运行时校验用）
// 顶层 z.uuid() / z.email() 是 zod 4 的写法；z.string().uuid() 等旧写法仍在但已废弃。
export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, "名称不能为空"),
  age: z.number().int().min(0).optional(),
  email: z.email(),
});

// 2. 从schema推断TS类型（前端组件、接口类型直接复用）
export type User = z.infer<typeof UserSchema>;
