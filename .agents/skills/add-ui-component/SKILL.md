---
name: add-ui-component
description: This skill should be used when a component is being added to or wrapped in the shared UI package — when the user asks to "add a UI component", "wrap antd's Table", "add a component to packages/ui", "加一个组件到 ui 包", or when an app needs an antd component that is not exported yet. It covers the barrel export, the "use client" decision, and how to type a wrapper so refs forward correctly under React 19.
---

# Adding a UI component to `@repo/ui`

This package exists so applications never depend on `antd` directly. Adding a component here is how you extend what apps can use — **never** by adding `antd` to an app's `package.json`.

Read the `packages/ui` subsection of [`AGENTS.md`](../../../AGENTS.md) and [`packages/ui/README.md`](../../../packages/ui/README.md) if you have not.

## Decide: re-export, or wrap?

**Re-export** when antd's component is already what you want. Add its name to the existing `export { ... } from "antd"` list in `src/index.ts`. Nothing else is needed.

**Wrap** when the project needs a different default, extra behaviour, or a narrower API. Create `src/<name>.tsx`.

Default to re-exporting. A wrapper you do not need is a layer someone has to maintain and reason about; the barrel already gives you a single place to swap antd out later.

## Writing a wrapper

```tsx
"use client";

import { Switch as AntSwitch } from "antd";
import type { ComponentProps } from "react";

/**
 * antd Switch 的项目包装。
 *
 * props 类型取 ComponentProps 而不是 antd 导出的 SwitchProps，
 * 这样 ref 在 React 19 下也能正确透传（ref 是普通 prop）。
 */
export type SwitchProps = ComponentProps<typeof AntSwitch>;

export function Switch(props: SwitchProps) {
  return <AntSwitch {...props} />;
}
```

Three things are load-bearing:

1. **`"use client"` at the top** if the component is interactive. antd components carry state, effects and event handlers; used from a server component without this, it fails at runtime rather than at build time. Pure presentational re-exports (`Typography`, `Flex`) do not need it.
2. **Type props as `ComponentProps<typeof AntX>`, not antd's exported `XProps`.** Under React 19 `ref` is an ordinary prop, and `ComponentProps` includes it so `{...props}` forwards it. antd's own prop types may not.
3. **Keep antd's props intact** unless you have a specific reason to narrow them. A wrapper that silently drops props is a trap for whoever uses it next.

## Export it from the barrel

`packages/ui/src/index.ts` — add the name to the appropriate place:

```ts
// Own components
export { Switch, type SwitchProps } from "./switch";

// Re-exports from antd
export {
  Alert,
  App,
  Card,
  // ... add the new name to this list
} from "antd";
```

**Never `export * from "antd"`.** The curated list is the point: it is a readable statement of what this package promises, and it is what makes swapping the underlying library tractable.

**Update the export table in [`packages/ui/README.md`](../../../packages/ui/README.md)** in the same change. The README is the human-facing contract; leaving it stale makes it untrustworthy.

## What not to do

- **Do not add `@ant-design/nextjs-registry` to this package.** It is a Next.js concern and belongs in the app's `layout.tsx`. Importing it here would make the UI package depend on Next.
- **Do not add a `ConfigProvider` or a `theme` object here beyond `src/theme.ts`.** There is exactly one theme for the repo. If a token needs to change, change `src/theme.ts`.
- **Do not give this package a build script or a `dist/` output.** It is consumed as source.
- **Do not import from `apps/*`.** Nothing in `packages/` may depend on an application.

## Verify

```sh
pnpm --dir packages/ui exec eslint .
pnpm check-types
pnpm build        # from the repo root — confirms the app can compile the new export
```

Anything using antd state or `App.useApp()` must be a client component — see the `apps/openrouter-web` section of [`AGENTS.md`](../../../AGENTS.md).

## Checklist

- [ ] Re-exported, or wrapped with `ComponentProps<typeof AntX>` and `"use client"` where interactive
- [ ] Added to `src/index.ts` as a named export
- [ ] Export table in `packages/ui/README.md` updated
- [ ] No `antd` dependency added to any app
- [ ] `pnpm lint`, `pnpm check-types`, `pnpm build` pass
