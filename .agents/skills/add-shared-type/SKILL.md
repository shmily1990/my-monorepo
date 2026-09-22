---
name: add-shared-type
description: This skill should be used when a type needs to be shared across packages in this monorepo — when the user asks to "add a shared type", "add a type to x-typings", "define an Order type", "加一个共享类型", or when a type is about to be duplicated in two packages. It covers the Zod-schema-as-single-source-of-truth pattern, the barrel export, and the Zod 4 API differences that trip people up.
---

# Adding a shared type

Every shared type in this repo has exactly one source of truth: a Zod schema in `@repo/x-typings`. The TypeScript type is derived from it, never written alongside it. This is what keeps runtime validation and compile-time types from drifting apart.

Read the `packages/x-typings` subsection of [`AGENTS.md`](../../../AGENTS.md) if you have not.

## Should it live here?

Put the type in `x-typings` when **two or more packages need the same shape** — commonly because a form and an API client must agree, or a backend contract is mirrored in the frontend.

Do **not** put it here when:

- Only one package needs it → keep it local to that package.
- It is a UI concern (component props) → it belongs next to the component in `@repo/ui`.
- It is a pure type with no runtime validation and no second consumer → a local `type` is fine.

The value of this package is that there is _one_ place to look. Adding speculative types erodes that.

## Step 1 — create the module

`packages/x-typings/src/<name>.ts`:

```ts
import { z } from "zod";

// 1. 定义 zod 校验 schema（运行时校验用）
export const OrderSchema = z.object({
  id: z.uuid(),
  total: z.number().nonnegative(),
  note: z.string().optional(),
});

// 2. 从 schema 推断 TS 类型（组件与接口类型直接复用）
export type Order = z.infer<typeof OrderSchema>;
```

Rules:

- **The schema is exported alongside the type.** Consumers writing runtime validation need it; consumers needing only the type use `import type` and pay nothing.
- **Use Zod 4's top-level validators**: `z.uuid()`, `z.email()`, `z.url()`. The older `z.string().uuid()` and `z.string().email()` forms still run but are deprecated — do not introduce new uses.
- **Never write an `interface` next to the schema.** If you find yourself doing it, that is the drift this package exists to prevent.
- Give error messages in Chinese where a user would see them (`z.string().min(1, "名称不能为空")`), matching `src/user.ts`.

## Step 2 — export it from the barrel

`packages/x-typings/src/index.ts`:

```ts
export * from "./order";
```

One line per module. Without this the module is unreachable — `exports` maps only `"."` to `src/index.ts`, so deep imports like `@repo/x-typings/order` do not resolve.

## Step 3 — consume it

Add the dependency if the consumer does not have it yet:

```json
{ "dependencies": { "@repo/x-typings": "workspace:*" } }
```

Then:

```ts
// Only the type — erased at compile time, Zod stays out of your bundle.
import type { Order } from "@repo/x-typings";

// The schema too — only when you validate at runtime.
import { OrderSchema, type Order } from "@repo/x-typings";
```

**Prefer `import type` unless you are actually parsing.** Importing the schema pulls all of Zod into the consumer's bundle for no benefit if the type is all you needed.

## Step 4 — verify

```sh
pnpm check-types
pnpm lint
```

To confirm the type really crosses the package boundary rather than silently resolving to `any`, temporarily rename a field in the schema and re-run `pnpm check-types` — the consuming file should fail with `TS2339` naming the field. Undo the rename afterwards.

## Checklist

- [ ] Schema exported and type derived via `z.infer`, in the same module
- [ ] Zod 4 top-level validators used, not the deprecated string methods
- [ ] Re-exported from `src/index.ts`
- [ ] Consumer declares `workspace:*` and prefers `import type`
- [ ] `pnpm check-types` and `pnpm lint` pass
