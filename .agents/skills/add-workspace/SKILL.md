---
name: add-workspace
description: This skill should be used when a new package or app is being added to this Turborepo monorepo — when the user asks to "add a package", "create a new workspace", "scaffold packages/x-api", "新建一个包", or "建一个新 workspace". It covers the four files every workspace needs, which tsconfig base and ESLint entry to pick, and the conventions that make the difference between a workspace that is linted and one that is silently skipped.
---

# Adding a workspace

A workspace in this repo is four files plus two edits elsewhere. The order matters: skip a step and the package will exist but be invisible to linting.

Before starting, read the root [`AGENTS.md`](../../../AGENTS.md) if you have not.

## Decide first: what kind of package is this?

Answer these three questions before writing anything, because they determine every file below.

1. **Does it contain React components?** → yes: use the `react-library` ESLint entry and `react-library.json`; no: use `base` and `base.json` for Node-side code, or `bundler.json` if a bundler compiles it.
2. **Does it need bundler-style module resolution?** If the package ships source consumed by a bundler (the normal case here), yes. That is `bundler.json` — and `react-library.json` / `nextjs.json` already extend it, so only a non-React, non-Next bundler package names it directly. See step 2 — this is where the `TS2835` trap lives.
3. **Does it need a runtime dependency on another `@repo/*` package?** If so, declare it in `dependencies`; config packages go in `devDependencies`.

## Step 1 — `package.json`

```json
{
  "name": "@repo/<name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "eslint": "9.39.5",
    "typescript": "6.0.3"
  }
}
```

Non-negotiables:

- **`exports` points at `./src`.** No `dist`, no `main`, no `types` field, **no `build` script**. Internal packages are consumed as source — see [docs/architecture.md](../../../docs/architecture.md) for why.
- **`"lint"` must exist**, with `--max-warnings 0`. A workspace is linted _only if it has a `lint` script_ — `lint-staged.config.mjs` and Turbo both key off it. Omit it and the package is silently never checked.
- **`"check-types"` must exist** so the package participates in `turbo run check-types`.
- **Pin every dependency exactly.** `"zod": "4.6.5"`, never `"^4.6.5"`. Copy versions from a sibling package rather than typing them from memory.
- **`eslint` and `typescript` versions must match the other workspaces exactly**, or you will get two copies in the lockfile.

### The `type` field interacts with the tsconfig tier

`"type": "module"` makes the package ESM. Under `NodeNext` that means **every relative import needs an explicit `.js` extension**, and `export * from "./foo"` fails with `TS2835`.

That combination is now avoidable rather than something you patch per package: **`bundler.json` exists as its own tier**, so anything a bundler compiles extends it (or extends `react-library.json`, which extends it) and never meets `NodeNext` at all. `packages/x-typings` declares `"type": "module"` and extends `bundler.json` for exactly this reason.

Omitting `type` makes it CommonJS, and `NodeNext` permits extensionless relative imports. `packages/ui` takes this path.

Either is fine. What is not fine is adding `"type": "module"` to an existing package that was written without it — that is how you break every relative import at once. Nor is it fine for a bundler-compiled package to extend `base.json` directly while a sibling it imports is ESM: `tsc` pulls that sibling's _source_ into a `NodeNext` program and reports `TS2835` against files that are themselves correct. See §7 of [docs/conventions.md](../../../docs/conventions.md).

## Step 2 — `tsconfig.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

- Pick the tier per the decision above: **`base.json`** for Node-side code; **`bundler.json`** for anything a bundler compiles that is neither Next nor React; **`react-library.json`** for React components; **`nextjs.json`** for a Next app. The last two already extend `bundler.json`, so no per-package override is needed.
- **`noEmit: true` is required** — this package is never built. (`bundler.json` already sets it.)
- **If the package is ESM (`"type": "module"`) and ships source, also add**:
  ```json
  "module": "ESNext",
  "moduleResolution": "Bundler"
  ```
  **Extending `bundler.json` (or `react-library.json`) already gives you both** — a per-package override is only needed if you extend `base.json`. `packages/x-typings/tsconfig.json` extends `bundler.json` and carries no override.
- **A `tsconfig.json` is mandatory, not optional.** ESLint runs with `projectService: true`; a linted workspace without a tsconfig fails lint outright.

## Step 3 — `eslint.config.js`

```js
import { baseConfig } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config[]} */
export default baseConfig;
```

Swap `baseConfig` for `reactLibraryConfig` (React packages) or `nextJsConfig` (Next.js apps). The file may be `.js` or `.mjs` — `.mjs` if the package has no `"type"` field and you want ESM.

Pick the entry by what the package **is**, not by what rules you want. Bringing in `next-js` for a library would hand it Next.js rules that have no business there.

## Step 4 — `src/index.ts`

Create the barrel even if it is empty at first:

```ts
export {};
```

Every public export goes through here. Consumers import from the package root, not from internal paths.

## Step 5 — wire it up

```sh
# 1. If anything consumes it, add to that package's dependencies:
#    "@repo/<name>": "workspace:*"
pnpm install
pnpm lint        # the new package must appear in the task list
pnpm check-types
```

## Step 6 — document it

- Add a row to the workspaces table in the root [`README.md`](../../../README.md) and in [`AGENTS.md`](../../../AGENTS.md).
- If the package has rules that are easy to get wrong, add a short subsection under **Per-workspace rules** in [`AGENTS.md`](../../../AGENTS.md). **Do not create a per-package agent file** — this repo keeps a single canonical spec file.
- Add a `README.md` for humans, which is where the full explanation belongs.

## Checklist

- [ ] `package.json` with `lint` + `check-types` scripts, exact pins, `exports` → `./src`, no build script
- [ ] `tsconfig.json` extending the right base, with `noEmit` and — if ESM — the `Bundler` override
- [ ] `eslint.config.*` using the right entry
- [ ] `src/index.ts` barrel
- [ ] Consumers updated with `workspace:*`, `pnpm install` run
- [ ] `pnpm lint` shows the new package and passes
- [ ] Root `README.md` and `AGENTS.md` tables updated
