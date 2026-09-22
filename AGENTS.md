# AGENTS.md

本文件是本仓库对 AI 编码助手的唯一规范源，任何工具都读这一份；架构与规范的完整说明在 `docs/`。

The single source of truth for AI agents working in this repo. It answers two questions: _what this repo is_ and _what is not negotiable_. Depth lives in [`docs/`](docs/) — read those rather than expecting this file to be complete.

> **Why this file is named `AGENTS.md`.** It is the cross-tool convention, read natively by OpenAI Codex, Cursor, GitHub Copilot and 30+ other agents. Claude Code does **not** read it — it hardcodes `CLAUDE.md`. So [`CLAUDE.md`](CLAUDE.md) exists as a two-line pointer that imports this file. Same for skills: the canonical copy lives in [`.agents/skills/`](.agents/skills/), and `.claude/skills` is a symlink to it. **Edit the canonical copy only**; never edit through the pointer.

## What this repo is

A Turborepo monorepo. Node 24 ([.nvmrc](.nvmrc)), pnpm 11 through Corepack, TypeScript 6, ESLint 9 (flat config), Prettier 3, React 19, Next.js 16, Ant Design 6. Every dependency is pinned to an exact version — no carets.

## Workspaces

| Path                         | Package                   | Role                                                         |
| ---------------------------- | ------------------------- | ------------------------------------------------------------ |
| `apps/web`                   | `web`                     | The only application. Next.js App Router.                    |
| `packages/ui`                | `@repo/ui`                | The UI layer. Wraps Ant Design so apps never depend on antd. |
| `packages/x-typings`         | `@repo/x-typings`         | Shared types. Zod schemas are the source of truth.           |
| `packages/eslint-config`     | `@repo/eslint-config`     | ESLint flat configs, three entry points.                     |
| `packages/typescript-config` | `@repo/typescript-config` | Shared `tsconfig.json` bases.                                |

**Dependency direction**: `apps/web` → `@repo/ui`, `@repo/x-typings`. The two config packages are `devDependencies` everywhere. **Nothing depends on an app.** A library must never import from `apps/*`.

Full architecture, including _why_ it is shaped this way, is in [docs/architecture.md](docs/architecture.md).

## Hard rules

These are not style preferences. Breaking one is a defect.

1. **Apps never import `antd` directly.** Components come from `@repo/ui`. Adding `antd` to `apps/web/package.json` is wrong even though it would type-check. **Lint enforces this** — `import/no-extraneous-dependencies` catches it, and `apps/web/eslint.config.js` adds an explicit ban that tells you the right fix. If you hit that error, add the component to `packages/ui/src/index.ts`; do not install antd.
2. **Shared types are defined only in `@repo/x-typings`**, and always as a Zod schema with the TypeScript type derived via `z.infer`. Never write a type and a schema separately.
3. **Internal packages are consumed as source.** `exports` points at `./src`; there is no `dist/` and no build script. Do not add a build step to `packages/ui` or `packages/x-typings`.
4. **Pin versions exactly.** Write `"antd": "6.6.5"`, never `"^6.6.5"`. The one exception is `turbo` at the root.
5. **Run ESLint per workspace, never from the repo root.** Use `pnpm lint`. Invoking eslint from the root gives it the wrong cwd: flat config resolves upward from cwd, `@next/next` cannot find the pages directory, and typescript-eslint's `projectService` sees every workspace's tsconfig at once — it degrades silently rather than failing.
6. **Never hand-edit generated files**: `pnpm-lock.yaml`, `apps/web/next-env.d.ts`, `.husky/_/`, `.next/`, `.turbo/`.

Also, in descending order of how often it bites: a workspace is linted **only if it has a `lint` script**; a workspace that is linted **must have its own `tsconfig.json`** (typescript-eslint's project service requires it); and `packages/*` sourcing from an app is a boundary violation, not a shortcut.

Two more are enforced by lint and will fail on you: **never import across packages by relative path** (`../../packages/ui/src/...`) — use the package name, `import/no-relative-packages` will reject it; and **never import something you have not declared** in the nearest `package.json`, `import/no-extraneous-dependencies` will reject it. The second is the workhorse — it is what makes "apps cannot use antd" true rather than aspirational.

## Per-workspace rules

Each of these was a separate `CLAUDE.md` before; they are consolidated here so no per-package agent file has to be maintained. The full explanation for each is in that package's `README.md`.

### `apps/web`

- **Put reusable things downstream.** Shared types → `@repo/x-typings`. Reusable components → `@repo/ui`. Only route-level UI and business wiring belongs in `app/`.
- **No `ConfigProvider` here.** Theme and locale are owned by `@repo/ui/src/theme.ts`; two `ConfigProvider`s means two sources of truth.
- **`app/layout.tsx` needs both wrappers, in this order**: `<AntdRegistry>` (from `@ant-design/nextjs-registry`) then `<UiProvider>` (from `@repo/ui`). This split is deliberate — `AntdRegistry` is a Next.js concern, and putting it in `@repo/ui` would make the UI package depend on Next. Wiring only one is a real failure: `UiProvider` alone leaves the first paint unstyled; `AntdRegistry` alone loses the shared theme.
- **Anything touching antd state, events or `App.useApp()` must be a client component** — add `"use client"`. Keep `page.tsx` and `layout.tsx` as server components and put interactive pieces in their own files, as `antd-demo.tsx` does.
- `check-types` runs `next typegen && tsc --noEmit`; the `next typegen` half is required.

### `packages/ui`

- **Export from the barrel, one name at a time.** New components and re-exports go in `src/index.ts` as named exports. Never `export * from "antd"` — the curated list _is_ the contract. Update the export table in `README.md` in the same change.
- **Interactive components need `"use client"`.** Forgetting it fails at runtime, not at build time.
- **Wrappers must keep antd's props intact.** Type them as `ComponentProps<typeof AntX>`, not antd's own `ButtonProps`, so `ref` forwards correctly under React 19. See `src/button.tsx`.
- **Never import `@ant-design/nextjs-registry` here** — it is a Next.js concern and belongs in the app's `layout.tsx`.
- **Theme lives only in `src/theme.ts`**, locale only in `src/provider.tsx`.
- **Never add a build script or `dist/`.** Consumed as source. Note the `"./*"` export glob matches only `.tsx`, so `@repo/ui/theme` is not resolvable by path — import it from the barrel.
- **This package has no `"type"` field, and that is load-bearing.** It inherits `NodeNext` from `react-library.json`; under ESM (`"type": "module"`) that would demand an explicit `.js` extension on every relative import. Do not add `"type": "module"` without first moving it to a `Bundler`-resolved tsconfig.

### `packages/x-typings`

- **One source of truth per type: a Zod schema.** Derive the type with `z.infer<typeof Schema>`. Never write an interface alongside a schema — that is the drift this package exists to prevent.
- **Re-export from `src/index.ts`**, one line per module.
- **Use Zod 4 top-level validators** (`z.uuid()`, `z.email()`); the `z.string().uuid()` forms are deprecated.
- **Consumers should use `import type` when they only need the type** — it is erased at compile time and keeps Zod out of the importing bundle.
- **Never add a build script or `dist/`.**
- This package **overrides `module`/`moduleResolution` to `ESNext`/`Bundler`** in its own tsconfig, because it declares `"type": "module"` and `base.json`'s `NodeNext` would otherwise demand `.js` extensions on relative imports (`TS2835`). It is a self-declared exception to "all tsconfig lives in `typescript-config`"; [docs/conventions.md](docs/conventions.md) records it and the clean fix.

## Commands

```sh
nvm use            # ALWAYS, in every new terminal — see below
pnpm install
pnpm dev           # web on :3000
pnpm lint          # turbo run lint, every workspace, --max-warnings 0
pnpm check-types
pnpm build
pnpm format        # prettier --write .
pnpm format:check
```

**`nvm use` is not optional.** nvm only falls back to its `default` alias when it cannot find _any_ node on `PATH`. A terminal launched from the GUI or an IDE often inherits a stale `PATH`, and nvm then silently keeps the wrong version. Run `nvm use` and check `node -v`.

More traps, with symptoms, in [docs/getting-started.md](docs/getting-started.md).

## Before you change something

| Changing…                        | Read first                                                         |
| -------------------------------- | ------------------------------------------------------------------ |
| Anything in `packages/ui`        | [`packages/ui/README.md`](packages/ui/README.md) + the rules above |
| Anything in `packages/x-typings` | [`packages/x-typings/README.md`](packages/x-typings/README.md)     |
| ESLint or tsconfig rules         | [docs/conventions.md](docs/conventions.md)                         |
| Adding a workspace               | the `add-workspace` skill                                          |
| Adding a shared type             | the `add-shared-type` skill                                        |
| Adding a UI component            | the `add-ui-component` skill                                       |

## The rule list

[docs/conventions.md](docs/conventions.md) lists every convention with its source and how strongly it is enforced today: `[已强制]` (a machine stops you), `[待强制]` (prose only, with the mechanism that would enforce it), `[约定]` (style and process). Check it before assuming a rule is merely advisory.
