# `@repo/x-typings`

我们约定共享类型在这里定义，子应用或者子包在这里引入。

The single place shared types live in this monorepo. Every type has one source of truth: a Zod schema. The TypeScript type is derived from that schema rather than written alongside it, so runtime validation and compile-time types cannot drift apart.

## Adding a type

1. Create a file under `src/` — for example `src/order.ts`.
2. Declare a Zod schema and infer the type from it:

```ts
import { z } from "zod";

export const OrderSchema = z.object({
  id: z.uuid(),
  total: z.number().nonnegative(),
});

export type Order = z.infer<typeof OrderSchema>;
```

3. Re-export it from `src/index.ts`:

```ts
export * from "./order";
```

## Consuming a type

Declare the workspace dependency:

```json
{
  "dependencies": {
    "@repo/x-typings": "workspace:*"
  }
}
```

Then import from the package root:

```ts
import { OrderSchema, type Order } from "@repo/x-typings";
```

When you only need the type, use `import type { Order }` — that form is erased at compile time and keeps Zod out of the importing bundle.

## Consumed as source, not built

`exports` points straight at `./src/index.ts`. There is no `dist/`, no `build` script, and no Turbo build task — the consumer's bundler compiles this source directly. This matches `packages/ui`, and it removes the failure mode where `dist` goes stale and type errors get reported against an old build.

## Why this package overrides its own tsconfig

It extends `@repo/typescript-config/base.json` but overrides `module` and `moduleResolution` to `ESNext` / `Bundler`. `base.json` uses `NodeNext`, which demands an explicit `.js` extension on every relative import — `export * from "./user.js"`. That is right for Node-side code and wrong here: these files are consumed by a bundler, which wants extensionless specifiers. Without the override `src/index.ts` fails to compile with `TS2835`.

The override also means this package sits slightly outside the "all tsconfig lives in `@repo/typescript-config`" convention stated at the top of this repo's config packages. **The fix would be a `bundler.json` in that package** doing exactly what this override does, so this package could extend it instead. Until one exists, the local override stays.

> [!NOTE]
> **`packages/ui` inherits the same `NodeNext` settings and does _not_ hit `TS2835`.** The deciding factor is the `type` field, not the presence of relative imports: this package declares `"type": "module"`, so its files are ESM and `NodeNext` demands explicit extensions. `packages/ui` has no `type` field, so Node treats it as CommonJS and `NodeNext` permits extensionless relative imports — verified, its `src/index.ts` uses `export { ... } from "./button"` and type-checks clean.
>
> The practical consequence: adding `"type": "module"` to `packages/ui` would make the trap live there. Worth knowing before aligning that package's `type` field with the rest of the repo.

## Zod version

Pinned exactly, like every other dependency in this repo. Currently Zod 4, where `z.uuid()` and `z.email()` are top-level functions rather than methods on `z.string()`. The old `z.string().uuid()` form still works but is deprecated. Note that Zod 4's root export declares its types from a `.d.cts` file, which resolves cleanly under `moduleResolution: Bundler` with `esModuleInterop` — verified, but worth knowing if either setting changes.
