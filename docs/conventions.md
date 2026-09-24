# 规范清单

本文件把散落在各 README 与代码注释里的约定收拢到一处，并标注每条今天被强制的程度。

Every convention in this repo, collected in one place, each marked with how strongly it is enforced today. Each entry names its source so the entry can be checked against the code it describes — when a source moves or disappears, this file is wrong and should be fixed.

## 三档标记

| 标记       | 含义                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| `[已强制]` | 今天有机器会拦住违规。括号里写明是什么在拦。                                     |
| `[待强制]` | 目前只有文字约定。括号里写明**将来用哪个机制强制、写在哪个文件**，以便直接施工。 |
| `[约定]`   | 属于风格或流程，不打算机器化。                                                   |

来源写作 `文件:行`。行号会随代码变动而漂移，定位时以文件名和上下文为准。

**一条维护规则**：某条约定从 `[待强制]` 变成 `[已强制]` 时，**把散文描述删掉，只留「由 X 强制」一行**。留下大段解释等于让文档成为规则的第二个副本，两份迟早会不一致——而文档是较不可信的那一份。文档的价值在「为什么」和「将来怎么做」，不在复述代码已经说清楚的事。

---

## 1. 版本与工具链

| #   | 约定                                                                | 来源                                             | 强制状态                                                                                                                        |
| --- | ------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Node.js >= 24，由 `.nvmrc` 钉住                                     | `README.md`, `.nvmrc`, 根 `package.json#engines` | `[已强制]` — 由根 `.npmrc` 的 `engine-strict=true` 强制。已验证 1307 个声明了 `engines.node` 的已安装包中，没有一个排除 Node 24 |
| 1.2 | pnpm 11，版本取自根 `package.json#packageManager`，由 Corepack 提供 | `README.md`, 根 `package.json`                   | `[已强制]` — `packageManager` 字段由 Corepack 读取                                                                              |
| 1.3 | Corepack 随 Node 24 自带，Node 25+ 不再自带                         | `README.md`                                      | `[约定]`                                                                                                                        |
| 1.4 | 每开新终端必须 `nvm use` 并核对 `node -v`                           | `README.md`, `AGENTS.md`                         | `[约定]` — 这是环境陷阱，不是仓库能强制的（见 `docs/getting-started.md`）                                                       |
| 1.5 | 所有依赖精确锁版本，无 caret；唯一例外是根目录的 `turbo`（`^2.x`）  | 各处 `package.json`                              | `[已强制]` — 由根 `.npmrc` 的 `save-exact=true` 强制。**只约束将来新增的依赖**，不会回头校验已有条目（存量已合规）              |
| 1.6 | ESLint 钉在 9.x                                                     | `packages/eslint-config/package.json`            | `[约定]` — 原因见第 7 节                                                                                                        |
| 1.7 | TypeScript 钉在 6.x                                                 | 各处 `package.json`                              | `[约定]` — 原因见第 7 节                                                                                                        |
| 1.8 | antd 精确钉在 6.x（原生支持 React 19）                              | `packages/ui/README.md`                          | `[已强制]` — `packages/ui/package.json` 精确锁 `6.6.5`                                                                          |
| 1.9 | Zod 精确钉在 4.x                                                    | `packages/x-typings/README.md`                   | `[已强制]` — `packages/x-typings/package.json` 精确锁 `4.6.5`                                                                   |

## 2. 依赖方向与架构边界

| #   | 约定                                                                                   | 来源                             | 强制状态                                                                                                                                                                                                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | 应用不得直接 `import` antd，必须经 `@repo/ui`                                          | `packages/ui/README.md`:71       | `[已强制]` — 由 `base.js` 的 `import/no-extraneous-dependencies` 强制（antd 不在 `apps/openrouter-web` 的 dependencies 里），**该应用的 `eslint.config.mjs` 并没有内联的 `no-restricted-imports`**（它只有一行 `export default nextJsConfig;`），所以拦下来的报错里不会出现「该往哪里加组件」的指引 —— 那一半尚未落地              |
| 2.2 | 应用不得自加 `antd` 依赖，以保证构建里只有一份 antd cssinjs                            | `packages/ui/README.md`:71       | `[已强制]`（目的已达成，手段未强制）— 即使有人往 `apps/openrouter-web` 加了 `antd`，「antd 不在该应用的 dependencies 里」这个前提就消失了，2.1 的兜底也随之失效 —— 所以这一条的目标**并非**无条件达成，它依赖「没人往应用里加 antd」这个前提。**仍缺**：「不许把它写进 package.json」本身没人拦，而多一份 antd 会让 cssinjs 变两份 |
| 2.3 | `packages/*` 不得依赖 `apps/*`；任何包不得依赖应用                                     | `AGENTS.md`                      | `[已强制]`（相对路径部分）— 由 `import/no-relative-packages` 强制。**仍缺**：用包名把应用声明成依赖这条路要 `turbo boundaries`，而它需要 CI 才成为门禁（见第 3 条注）                                                                                                                                                              |
| 2.4 | 两个 config 包只作为 `devDependencies` 出现，绝不进 `dependencies`                     | 各 `package.json`                | `[待强制]` — 落点同 2.3 的 `turbo boundaries`                                                                                                                                                                                                                                                                                      |
| 2.5 | 共享类型只能定义在 `@repo/x-typings`                                                   | `packages/x-typings/README.md`:3 | `[待强制]` — 难以机器判定「什么算共享类型」。落点：只做约定 + code review；可加一条 lint 规则禁止在 `apps/` 下新建 `types/` 目录                                                                                                                                                                                                   |
| 2.6 | `AntdRegistry` 留在应用、`UiProvider` 来自 `@repo/ui`，两者必须同时存在                | `packages/ui/README.md`:20-35    | `[已强制]` — 由 `import/no-extraneous-dependencies` 强制：`@ant-design/nextjs-registry` 不在 `packages/ui` 的依赖里，UI 包引入它会直接报错                                                                                                                                                                                         |
| 2.7 | `message`/`notification`/`Modal` 必须用 `App.useApp()`，不得从 antd 模块直接取静态方法 | `packages/ui/README.md`:37-51    | `[已强制]`（部分）— 由 `packages/ui/eslint.config.mjs` 内联的 `no-restricted-imports` 强制，禁 `message` 与 `notification` 两个 import 名。**仍缺**：`Modal.confirm()` 这类静态调用是 import 规则看不见的；`Modal` 组件本身被合法再导出，不能连坐                                                                                  |
| 2.8 | 不得在应用里各自写 `ConfigProvider` 的 `theme`                                         | `packages/ui/src/theme.ts`       | `[已强制]` — 由 `import/no-extraneous-dependencies` 强制（`ConfigProvider` 未从 barrel 导出，只能从 antd 拿，而 antd 不在应用的依赖里；2.1 里提到的内联 `no-restricted-imports` 并不存在，所以实际只靠这一条拦）                                                                                                                   |

> **关于 `turbo boundaries`**：它是本仓库表达「依赖方向」类规则的最佳落点，但**仍是实验特性**（2.11 未转正）。两点容易踩：
>
> 1. **默认检查不需要任何配置就能跑** —— 「相对路径跳出包目录」与「import 未声明的包」是开箱即用的。别被「要先给所有包打 tag」吓住而推迟接入；tag 只在要写方向规则时才需要。另外它是**传递生效**的（依赖的依赖也查）。
> 2. **CLI 参数与网上文档不符** —— 2.11.2 是 `--ignore=all|prompt` 加 `--reason`（且忽略需要写明原因），**没有** `--exclude-errors`。以 `turbo boundaries --help` 为准。
>
> 它也不是 turbo 任务，不能进 `dependsOn`，必须单独调用。
>
> 另外，依赖方向类规则除了 `turbo boundaries`，还有一条零依赖的 ESLint 规则值得一并上：`import/no-relative-packages`（`eslint-plugin-import@2.32.0` 已安装且已在 `base.js` 注册），它专门拦「用相对路径跨包 import」。

## 3. 目录与包结构

| #   | 约定                                                                                                             | 来源                                                                | 强制状态                                                                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 3.1 | 内部包一律**源码消费**：`exports` 指向 `./src`，无 `dist/`、无 build 脚本、无 Turbo build 任务                   | `packages/ui/README.md`:57-59, `packages/x-typings/README.md`:49-51 | `[已强制]` — 无 build 脚本时 `turbo run build` 天然不执行该包                                                    |
| 3.2 | workspace **只有带 `lint` 脚本才会被 lint**                                                                      | `lint-staged.config.mjs`                                            | `[已强制]` — `lint-staged.config.mjs` 的 `hasLintScript()` 判据；turbo 也只对有该脚本的包跑任务                  |
| 3.3 | 被 lint 的 workspace **必须有自己的 `tsconfig.json`**                                                            | `packages/eslint-config/base.js`（`projectService: true`）          | `[已强制]` — 缺 tsconfig 时 lint 直接失败                                                                        |
| 3.4 | 新增 workspace 必须同时具备：`package.json`、`tsconfig.json`、`eslint.config.*`、`exports` 指向源码              | `AGENTS.md`                                                         | `[待强制]` — 落点：`turbo boundaries` 的 `PackageNotFound` 检查；或一个 CI 脚本断言每个 workspace 都有这三个文件 |
| 3.5 | `packages/eslint-config` 与 `packages/typescript-config` 刻意不参与 lint（无 `lint` 脚本、无 `eslint.config.*`） | `lint-staged.config.mjs` 注释                                       | `[已强制]` — 见 3.2                                                                                              |
| 3.6 | `@repo/ui` 的 `./*` glob 只匹配 `.tsx`，`.ts` 子路径（如 `@repo/ui/theme`）不可用，须从 barrel 取                | `packages/ui/README.md`                                             | `[已强制]` — `exports` 语义                                                                                      |

## 4. 类型

| #   | 约定                                                                                | 来源                                 | 强制状态                                                                                            |
| --- | ----------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 4.1 | 每个共享类型只有一个事实来源：一个 Zod schema；TS 类型由 `z.infer` 推导而非并列手写 | `packages/x-typings/README.md`:5     | `[约定]` — 无法可靠机器判定                                                                         |
| 4.2 | 新增类型：`src/<name>.ts` 写 schema 与 `z.infer` → 从 `src/index.ts` barrel 再导出  | `packages/x-typings/README.md`:7-27  | `[约定]` — 流程见 `add-shared-type` skill                                                           |
| 4.3 | 只需类型时用 `import type`，以免把 Zod 带进导入方 bundle                            | `packages/x-typings/README.md`:47    | `[待强制]` — 落点：`packages/eslint-config/base.js` 开 `@typescript-eslint/consistent-type-imports` |
| 4.4 | 用 zod 4 的顶层 `z.uuid()` / `z.email()`，不用已废弃的 `z.string().uuid()`          | `packages/x-typings/README.md`:64-66 | `[待强制]` — 落点：开 `@typescript-eslint/no-deprecated`                                            |

## 5. UI

| #   | 约定                                                                                                                                                              | 来源                                     | 强制状态                                                                                                                                                                                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | 所有 UI 组件在 `@repo/ui` 统一封装，子应用从这里引入                                                                                                              | `packages/ui/README.md`:3                | `[约定]`                                                                                                                                                                                                                                                                   |
| 5.2 | 新增组件从 `src/index.ts` **具名**再导出，不用 `export * from "antd"`                                                                                             | `packages/ui/src/index.ts` 注释          | `[约定]`                                                                                                                                                                                                                                                                   |
| 5.3 | 交互式组件必须在文件顶部加 `"use client"`                                                                                                                         | `packages/ui/README.md`:51               | `[约定]` — 漏了就运行时报错                                                                                                                                                                                                                                                |
| 5.4 | 包装而非再导出时，props 用 `ComponentProps<typeof AntX>` 类型化，使 `ref` 在 React 19 下正确透传                                                                  | `packages/ui/README.md`:63-67            | `[约定]`                                                                                                                                                                                                                                                                   |
| 5.5 | 应用接入需要两块，且**故意分置**：`AntdRegistry` 在应用、`UiProvider` 在 `@repo/ui`。只接一个会真实失败（只接 provider 首屏无样式；只接 registry 拿不到共享主题） | `packages/ui/README.md`:20-35            | `[约定]` — 见 2.6                                                                                                                                                                                                                                                          |
| 5.6 | 主题（含品牌色、locale）只在 `packages/ui/src/theme.ts` 与 `provider.tsx` 定义                                                                                    | `packages/ui/src/theme.ts`               | `[约定]` — 见 2.8                                                                                                                                                                                                                                                          |
| 5.7 | 应用里的样式一律用 SCSS Modules；设计令牌是 `styles/tokens.scss` 里的 `:root` 自定义属性，由 `app/layout.tsx` 引入一次                                            | `apps/openrouter-web/styles/tokens.scss` | `[约定]` — 需要 `sass` 在 devDependencies 里（已装）。**不用 SCSS 变量跨文件共享**：SCSS Modules 逐个文件独立编译，共享变量要在每个 module 写一遍 `@use` 加一条相对路径；而 Next 明确说 `sassOptions` 除 `implementation` 外没有类型，Turbopack 也不支持其中的 `functions` |
| 5.8 | `--or-brand`（`styles/tokens.scss`）与 `token.colorPrimary`（`packages/ui/src/theme.ts`）是同一事实的两份副本，必须同步改                                         | 两处文件注释                             | `[待强制]` — 落点：一个读 `@repo/ui` 的 `theme.token.colorPrimary` 并与 SCSS 比对的小脚本；目前只能靠 code review                                                                                                                                                          |

## 6. ESLint / Prettier / 提交

| #   | 约定                                                                                                 | 来源                                                                 | 强制状态                                                                                                                                                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 | **必须按 workspace 调用 ESLint，绝不从仓库根调用**（用 `pnpm lint`）                                 | `lint-staged.config.mjs` 注释, `packages/eslint-config/base.js` 注释 | `[已强制]` — `lint-staged.config.mjs` 用 `pnpm --dir <ws>` 分发；turbo 也以各包为 cwd                                                                                                                                                             |
| 6.2 | 每个 `lint` 脚本带 `--max-warnings 0`，warning 也失败                                                | 各 workspace `package.json`                                          | `[已强制]`                                                                                                                                                                                                                                        |
| 6.3 | 不用 `eslint-plugin-only-warn`（它把 error 降级为 warn，与 `--max-warnings 0` 互相抵消）             | `packages/eslint-config/base.js` 历史                                | `[已强制]` — 依赖已移除                                                                                                                                                                                                                           |
| 6.4 | **Prettier 不经过 ESLint**，没有 `prettier/prettier` 规则；格式化是独立的根任务                      | `packages/eslint-config/README.md`                                   | `[已强制]` — 规则不存在                                                                                                                                                                                                                           |
| 6.5 | ESLint 分三个入口按包类型分发规则：`base` / `react-library` / `next-js`；Next 规则只出现在 `next.js` | `packages/eslint-config/README.md`                                   | `[已强制]` — 入口分发本身即约束                                                                                                                                                                                                                   |
| 6.6 | 提交前自动跑 lint-staged（`lint` + `prettier --write`，仅暂存文件）                                  | `.husky/pre-commit`, `lint-staged.config.mjs`                        | `[已强制]` — 但**可被 `git commit --no-verify` 绕过**；补这个缺口需要 CI，属于支柱三                                                                                                                                                              |
| 6.7 | `@typescript-eslint/no-explicit-any` 为 error；未使用的变量为 warn（`^_` 开头的变量与参数豁免）      | `packages/eslint-config/base.js`                                     | `[已强制]`                                                                                                                                                                                                                                        |
| 6.8 | `turbo/no-undeclared-env-vars` 为 error                                                              | `packages/eslint-config/base.js`                                     | `[已强制]`                                                                                                                                                                                                                                        |
| 6.9 | 未使用的 import 为 error，且**可自动修复**（保存即删、提交钩子也删）                                 | `packages/eslint-config/base.js`                                     | `[已强制]` — 由 `unused-imports/no-unused-imports` 强制。它同时要求把 `@typescript-eslint/no-unused-vars` 关掉（否则同一个变量报两次），并把未使用变量那半边交给 `unused-imports/no-unused-vars` 接手 —— **漏掉后者会让非 import 的检查静默消失** |

## 7. 已知的例外、冗余与陷阱

这些不是规则，是评审时需要知道的事实。写在这里是为了避免它们被当成 bug 反复「修复」。

**版本天花板**

- **ESLint 停在 9.x**：`eslint-plugin-react`（封顶 `^9.7`）与 `eslint-plugin-import`（封顶 `^9`）至今没有支持 ESLint 10 的版本。升 10 必须先换掉这两个插件。
- **TypeScript 停在 6.x**：typescript-eslint 需要 TypeScript 的 **JavaScript 编译器 API**。TypeScript 7 是原生 Go 移植版，主入口只导出 `version`，`ts.createProgram` 为 `undefined`，也没有 `tsserver`。`tsc` 在 7 上能跑，但类型感知 lint 不能。

**`NodeNext` 与 `type` 字段的相互作用**

- `base.json` 用 `module/moduleResolution: NodeNext`。在 **ESM** 包（`"type": "module"`，如 `packages/x-typings`）里，它要求每个相对导入带显式 `.js` 扩展名，否则报 `TS2835`。
- `packages/ui` **没有** `type` 字段，按 CommonJS 处理，`NodeNext` 允许无扩展名相对导入，因此不触发 `TS2835`。
- 由此推论：**给 `packages/ui` 加 `"type": "module"` 会让该陷阱生效**。对齐各包 `type` 字段前必须知道这一点。
- 打包器消费的包一律继承 `bundler.json`（`ESNext` + `Bundler` + `noEmit`），这一档已经建好，`nextjs.json` / `react-library.json` / `x-typings` 都从它继承 —— 各包不再需要局部覆盖。
- **跨包时这个陷阱会以「报在别人身上」的形式出现**：一个 `NodeNext` 包 import 一个 `"type": "module"` 的兄弟包时，类型检查会拉进后者的源码，于是 `TS2835` 报在后者那个本身毫无问题的文件上。`packages/x-editor` import `@repo/x-typings` 时就是这样撞出来的 —— 见到这类「报错文件自己没有错」的情况，先查两个包的 `moduleResolution` 档位是否一致。

**其它**

- **`EditorDataLoader` 是对 4.1（共享类型一律是 Zod schema）的一处有意例外。** 它定义在 `packages/x-typings/src/editor.ts`，是个**带方法的 interface** —— Zod 只能描述数据、描述不了方法。4.1 的用意是防止「schema 与手写类型两份、迟早漂移」，而方法接口没有对应的运行时形态，不存在会漂移的第二份。同一文件里的**数据**契约（`EditorDataset`、`EditorPoint` 等）仍然是 Zod schema + `z.infer`，规则只在这里让路。
- `packages/ui/tsconfig.json` 与 `apps/openrouter-web/tsconfig.json` 各自写了 `"strictNullChecks": true`，而 `base.json` 的 `strict: true` 已隐含它 —— 冗余，无害。`apps/openrouter-web/tsconfig.json` 还重复了 `nextjs.json` 已提供的 `plugins: [{ "name": "next" }]`。
- `packages/ui/package.json` 的 `exports` 用 `"./*": "./src/*.tsx"`，但所有消费方实际都走 barrel（`"."`），glob 目前无人使用。
- 根 `README.md` 是 create-turbo 模板的原文，除包清单外未针对本仓库改写。
- 仓库**没有任何测试框架、测试脚本或测试任务**。`lint`、`check-types`、`build` 是仅有的可验证信号。
