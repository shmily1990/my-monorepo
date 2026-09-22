# `@repo/ui`

我们约定 UI 组件在这里统一封装，子应用从这里引入。

The shared UI layer for this monorepo. It wraps [Ant Design](https://ant.design) so that apps never depend on `antd` directly: theme, locale and the antd version are pinned in one place, and the import surface is ours to change.

## What's in here

| Export                                                                                                | Kind                  | Notes                                                    |
| ----------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------- |
| `UiProvider`                                                                                          | own                   | Theme + locale + antd `App` context. Mount once per app. |
| `theme`                                                                                               | own                   | The single `ThemeConfig` for the whole repo.             |
| `Button`, `ButtonProps`                                                                               | own wrapper           | Thin passthrough over antd's `Button`.                   |
| `Alert`, `App`, `Card`, `Flex`, `Input`, `Modal`, `Select`, `Space`, `Table`, `Tooltip`, `Typography` | re-exported from antd | Curated. Add more as they're needed.                     |

Everything is reachable from one entry point, so a future theme change or library swap touches this package only.

## Wiring an app

Two pieces are required, and they live in different places on purpose:

```tsx
// apps/web/app/layout.tsx  — server component
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { UiProvider } from "@repo/ui";

<AntdRegistry>
  <UiProvider>{children}</UiProvider>
</AntdRegistry>;
```

- **`AntdRegistry` stays in the app.** It is a Next.js concern; putting it in `@repo/ui` would make the UI package depend on Next. It extracts antd's cssinjs styles during SSR so the first paint is styled.
- **`UiProvider` comes from `@repo/ui`.** It supplies the shared theme and locale, and wraps children in antd's `App`.

Adding only one of them is a real failure mode, not a cosmetic one: `UiProvider` alone leaves the first paint unstyled, and `AntdRegistry` alone leaves components on antd's defaults with no shared theme.

## Using `message` / `notification` / `Modal`

Take them from context, never from the antd module:

```tsx
"use client";
import { App } from "@repo/ui";

const { message } = App.useApp();
message.success("done");
```

`import { message } from "antd"` uses antd's static methods, which live outside the React tree: they cannot see `ConfigProvider`'s theme, and React 19 warns about them. `UiProvider` mounts the `App` component precisely so `App.useApp()` works.

Components that use any of these must be client components — add `"use client"` at the top of the file.

## Source, not built

Like the other internal packages, `exports` points at `./src/*` — no `dist/`, no build script, no Turbo build task. The consuming app's bundler compiles it.

The barrel entry is `"."` → `./src/index.ts`; the existing `./*` → `./src/*.tsx` glob still serves direct subpath imports. Note the glob only matches `.tsx`, so a `.ts` subpath (such as `@repo/ui/theme`) is not resolvable by path — import it from the barrel instead.

## Adding a component

1. Add `src/<name>.tsx` with `"use client"` if it is interactive.
2. If it is a wrapper rather than a re-export, keep antd's props intact — type them with `ComponentProps<typeof AntX>` so `ref` forwards correctly under React 19.
3. Export it from `src/index.ts`.

## Version constraints

`antd` is pinned exactly at **6.x**, which supports React 19 natively — the `@ant-design/v5-patch-for-react-19` workaround that antd 5 needs is not required here. Apps must not add `antd` as their own dependency; they get it through this package, which is what keeps exactly one copy of antd's cssinjs in the build.
