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

## tsconfig

It extends `@repo/typescript-config/bundler.json` (`module: ESNext`, `moduleResolution: Bundler`,
`noEmit`). It needs `Bundler` rather than `base.json`'s `NodeNext` because it declares
`"type": "module"`: under `NodeNext` an ESM package must write an explicit `.js` extension on every
relative import — `export * from "./user.js"` — and `src/index.ts` fails to compile with `TS2835`.

This package used to carry that override privately in its own `tsconfig.json`, which put it slightly
outside the "all tsconfig lives in `@repo/typescript-config`" convention. The `bundler.json` tier now
exists, so the override has moved there and this package just extends it.

> [!NOTE]
> **The deciding factor is the `type` field, not the presence of relative imports.** A
> `"type": "module"` package under `NodeNext` is ESM and needs explicit extensions; a package with no
> `type` field is CommonJS and `NodeNext` permits extensionless relative imports.
>
> **A `"type": "module"` package's source cannot be type-checked from a `NodeNext` program.** This is
> why the `Bundler` tier matters beyond this package: when `packages/x-editor` (a
> `react-library.json` package) first imported `@repo/x-typings`, `tsc` pulled this package's _source_
> into a `NodeNext` program and reported `TS2835` against this package's own `src/index.ts` — a file
> with nothing wrong in it. Any bundler-compiled package that imports this one would have hit the
> same wall.
>
> The practical consequence: `"type": "module"` is safe here only because this package resolves with
> `Bundler`. A `"type": "module"` package that resolved with `NodeNext` would need an explicit `.js`
> extension on every relative import.

## Zod version

Pinned exactly, like every other dependency in this repo. Currently Zod 4, where `z.uuid()` and `z.email()` are top-level functions rather than methods on `z.string()`. The old `z.string().uuid()` form still works but is deprecated. Note that Zod 4's root export declares its types from a `.d.cts` file, which resolves cleanly under `moduleResolution: Bundler` with `esModuleInterop` — verified, but worth knowing if either setting changes.
