# `@repo/eslint-config`

我们约定所有的 eslint 配置在这里配置，子应用或者子包在这里去引入。

Shared ESLint configurations for every app and package in this monorepo.

Three entry points, one per kind of workspace. Each is a flat config array — default-export it from `eslint.config.js` and you are done.

## Available configs

| Entry                               | Use for                            | Includes                                              |
| ----------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| `@repo/eslint-config/base`          | Node-side packages and tooling     | JS + TS rules, import validation, Turborepo env check |
| `@repo/eslint-config/react-library` | React libraries consumed as source | `base` + React + React Hooks                          |
| `@repo/eslint-config/next-js`       | Next.js apps                       | `react-library` + Next.js rules                       |

## Who uses what

| Workspace     | Entry                               |
| ------------- | ----------------------------------- |
| `apps/web`    | `@repo/eslint-config/next-js`       |
| `packages/ui` | `@repo/eslint-config/react-library` |

## Usage

```js
// packages/ui/eslint.config.mjs
import { reactLibraryConfig } from "@repo/eslint-config/react-library";

export default reactLibraryConfig;
```

The workspace must declare it as a `workspace:*` dev dependency:

```json
{
  "devDependencies": {
    "@repo/eslint-config": "workspace:*"
  }
}
```

## Conventions worth knowing

**Next.js rules never reach a library.** They appear only in `next.js`, so anything importing `react-library` cannot pick them up. That is the reason for three entry points instead of one config with `files` matchers — dispatch by entry point fails loudly, dispatch by glob fails quietly.

**Formatting is not an ESLint concern here.** There is no `prettier/prettier` rule. Run `pnpm format` / `pnpm format:check` from the repo root. Keeping Prettier out of the lint pipeline removes the failure mode where two differently-versioned Prettiers disagree and `format` and `lint` fight forever.

**Errors are errors.** There is no `eslint-plugin-only-warn`, and every lint script passes `--max-warnings 0`. A warning fails lint exactly like an error — so lower a rule's severity only when you mean to.

**Type-aware linting needs a tsconfig per workspace.** `projectService` is enabled and `tsconfigRootDir` resolves from the workspace's cwd, which Turborepo sets to that workspace. Any workspace that gets linted must have its own `tsconfig.json` extending `@repo/typescript-config` — otherwise lint fails outright rather than quietly skipping the file.

**`react.js` is internal.** It is the shared React layer imported by both `react-library.js` and `next.js`, and is deliberately excluded from `exports`.

## Known coupling

`react.js` carries an ignore list for `react/no-unknown-property` containing react-three-fiber's mesh props. The list is incomplete, and R3F is not yet a dependency of this repo. Extend it when R3F is actually added.

## Version constraints

Plugins here are pinned exactly, matching the rest of the repo. Two constraints are not obvious and are worth knowing before upgrading anything:

- **ESLint is held at 9.x.** Neither `eslint-plugin-react` (max `^9.7`) nor `eslint-plugin-import` (max `^9`) has a release supporting ESLint 10.
- **TypeScript is held at 6.x.** `typescript-eslint` needs TypeScript's JavaScript compiler API. TypeScript 7 is the native Go port and no longer exposes it — its main entry exports only `version`. `tsc` still works there, but type-aware linting does not.
