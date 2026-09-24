# `@repo/typescript-config`

我们约定所有的ts配置在这里配置，子应用或者子包在这里去引入

Shared `tsconfig.json` bases for every app and package in this monorepo.

Each config is a plain JSON file consumed via `extends`. There is no build step, no `main`/`exports` entry, and nothing to compile — adding a config means adding a file and referencing it by path.

## Available configs

| Config               | Extends        | Use for                                                                       |
| -------------------- | -------------- | ----------------------------------------------------------------------------- |
| `base.json`          | —              | The strictness floor. Node libraries, and anything not run through a bundler. |
| `bundler.json`       | `base.json`    | Anything a bundler compiles. Adds `ESNext` + `Bundler` + `noEmit`.            |
| `nextjs.json`        | `bundler.json` | Next.js apps.                                                                 |
| `react-library.json` | `bundler.json` | React component libraries consumed as source.                                 |

## Who uses what

| Workspace             | Config                                       |
| --------------------- | -------------------------------------------- |
| `apps/openrouter-web` | `@repo/typescript-config/nextjs.json`        |
| `packages/ui`         | `@repo/typescript-config/react-library.json` |
| `packages/x-editor`   | `@repo/typescript-config/react-library.json` |
| `packages/x-typings`  | `@repo/typescript-config/bundler.json`       |

**Why `bundler.json` exists as its own tier.** `base.json` sets `NodeNext`, which is right for
Node-resolved libraries and wrong for anything a bundler compiles: under `NodeNext` a package that
declares `"type": "module"` must write an explicit `.js` extension on every relative import
(`TS2835`). Before this tier existed, `nextjs.json` existed mainly to make that one override, and
`packages/x-typings` carried a private copy of it. The gap became visible when `packages/x-editor`
(a `react-library.json` package, i.e. `NodeNext`) imported `@repo/x-typings` (a `"type": "module"`
package): type-checking x-editor pulled x-typings' _source_ into a `NodeNext` program and failed
with `TS2835` on x-typings' own barrel. Any React library that imports a `"type": "module"`
sibling hits this, so the override belongs in a shared tier rather than in each package.

## Usage

Extend a config in the workspace's `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

The workspace must declare it as a `workspace:*` dev dependency:

```json
{
  "devDependencies": {
    "@repo/typescript-config": "workspace:*"
  }
}
```

## What `base.json` sets

Some options match TypeScript's defaults and are written out for visibility; others are genuine overrides. The ones worth knowing about:

- **`strict: true`** — full strict mode.
- **`noUncheckedIndexedAccess: true`** — _stricter than `strict` alone_. `arr[0]` and `record[key]` are typed `T | undefined`, so they need narrowing before use. This catches real bugs but is the most common surprise in this config.
- **`module` / `moduleResolution`: `NodeNext`** — correct for libraries resolved by Node. **Anything compiled by a bundler should extend `bundler.json` instead**, which overrides both to `ESNext` + `Bundler`; a bundled package that extends `base.json` directly will fail to resolve extensionless imports, and if it declares `"type": "module"` it will additionally fail with `TS2835`.
- **`isolatedModules: true`** — every file must be independently transpilable. Type-only re-exports need the `export type { ... }` form.
- **`moduleDetection: force`** — every file is treated as a module even without an `import`/`export`.
- **`incremental: false`** — written out explicitly although it already matches the TypeScript default. Keep it off: Turborepo owns caching, and stray `.tsbuildinfo` files can make type-check tasks report results computed from an earlier graph state.
- **`declaration` / `declarationMap: true`** — for libraries that emit types. Inert in `nextjs.json`, which sets `noEmit`.
- **`skipLibCheck: true`** — does not type-check `.d.ts` files from dependencies.
- **`lib: ["es2022", "DOM", "DOM.Iterable"]`** — the DOM libs are included even though `base.json` is also used for Node-side code, so `document`/`window` references will type-check outside a browser. Removing `DOM` would tighten this, at the cost of breaking any app config that relies on it.

## Per-config overrides

`bundler.json` adds:

- `module: ESNext`, `moduleResolution: Bundler` — overrides `base.json`, see above.
- `noEmit: true` — the bundler emits, not `tsc`.

`nextjs.json` adds:

- `jsx: preserve` — Next.js runs the JSX transform.
- `allowJs: true` — Next.js may compile JS.
- `plugins: [{ "name": "next" }]` — enables Next.js's editor tooling.

`react-library.json` adds only `jsx: react-jsx`, since these packages are consumed as source and do not emit.

## Making changes

These configs are inherited by every workspace, so a change here has repo-wide reach. After editing, run type checking from the root rather than a single workspace:

```sh
pnpm check-types
```

## Known redundancy

`apps/openrouter-web` and `packages/ui` each set `"strictNullChecks": true` explicitly. This is redundant — `base.json` already enables it via `strict: true`. It is harmless and can be removed.

`apps/openrouter-web` likewise repeats the `plugins: [{ "name": "next" }]` entry that `nextjs.json` already provides.
