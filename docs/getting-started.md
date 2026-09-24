# 上手指南

给第一次接触这个仓库的人。目标是把环境跑起来，并避开最容易踩的几个坑。

For anyone opening this repo for the first time. Get it running, then read the traps — they cost more time than the setup does.

## 前置要求

| 工具    | 版本         | 说明                                                                                          |
| ------- | ------------ | --------------------------------------------------------------------------------------------- |
| Node.js | >= 24        | 由 [`.nvmrc`](../.nvmrc) 钉住                                                                 |
| pnpm    | 11           | **不要手动安装**，由 Corepack 按 [package.json](../package.json) 的 `packageManager` 字段提供 |
| nvm     | 任意近期版本 | 本仓库用它管理 Node 版本                                                                      |

pnpm **不需要** `npm i -g pnpm`。手动装的全局 pnpm 反而会带来问题：它的版本可能与 `packageManager` 声明的不一致，而且装在某个 Node 版本下，切换 Node 后就消失了。

## 第一次跑起来

```sh
nvm use            # 切到 .nvmrc 指定的 Node
node -v            # 确认输出 v24.x
corepack enable    # 每个 Node 大版本执行一次
pnpm install
pnpm dev           # http://localhost:3002
```

`corepack enable` 只需在每个 Node 大版本下执行一次——它写入的 shim 是按 Node 版本存放的。将来升级 Node 后要重新执行。

## 常用命令

全部在**仓库根目录**执行：

```sh
pnpm dev           # 启动 openrouter-web（:3002）
pnpm build
pnpm lint          # 检查所有 workspace
pnpm check-types
pnpm format        # 写入格式
pnpm format:check  # 只检查，不改
```

`pnpm lint` 这类命令背后是 Turbo，它会**以每个包的目录为工作目录**执行该包自己的脚本。这一点很重要，见下面的坑 2。

提交时 husky 会自动对暂存文件跑 lint 与格式化。**不要用 `git commit --no-verify` 跳过它**——那是给紧急情况准备的逃生口，而 CI 目前还不存在，跳过就没有第二道防线了。

## 五个坑

### 坑 1：`node -v` 不是 24，但 `nvm use` 看起来成功了

**症状**：`pnpm install` 报 engine 不符，或 lint 行为诡异。

**原因**：nvm 只会在**完全找不到任何 node** 时才回退到它的 `default` 别名。macOS 上从 GUI 或 IDE 启动的终端会继承一份陈旧的 `PATH`，里面已经带着一个旧版 node——nvm 于是"将错就错"，静默沿用那个版本，**既不看 `default` 也不看 `.nvmrc`**。

**解法**：在**每个新终端**里先跑 `nvm use`，并用 `node -v` 确认。这是本仓库唯一一个必须靠人记住的步骤。

### 坑 2：从仓库根目录直接跑 eslint

**症状**：两种，都很迷惑人。

```
$ npx eslint apps/openrouter-web/features/home/index.tsx
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
```

或者，显式指定配置后"能跑"，但输出里有：

```
Pages directory cannot be found at .../frontend/pages or .../frontend/src/pages.
Multiple projects found, consider using a single `tsconfig` with `references`...
```

**原因**：flat config 是从**当前工作目录向上**查找配置文件，不是从被检查文件所在目录。仓库根没有 eslint 配置，所以第一种直接失败。第二种更糟——`@next/next` 的规则找不到 pages 目录，而 typescript-eslint 的 `projectService` 会同时看到所有 workspace 的 tsconfig，**类型感知 lint 静默给出错误结果**。它不报错，只给错答案。

**解法**：永远用 `pnpm lint`。Turbo 会为每个包设置正确的工作目录。需要针对单个包时用 `pnpm --dir packages/ui exec eslint .`。

### 坑 3：在应用里直接 `import { Button } from "antd"`

**症状**：`Could not resolve "antd"` 或 TS2307。

**原因**：这是**故意的**。`antd` 只是 `packages/ui` 的依赖，应用不该直接用它。

**解法**：从 `@repo/ui` 引入。需要的组件没被导出时，往 `packages/ui/src/index.ts` 的再导出清单里加一个——而不是在应用里绕过。同理，`message`/`notification`/`Modal` 要用 `App.useApp()` 取，见 [`packages/ui/README.md`](../packages/ui/README.md)。

### 坑 4：手改了 `pnpm-lock.yaml` 或 `next-env.d.ts`

**症状**：合并冲突，或改动莫名其妙被覆盖。

**原因**：两者都是生成物。`pnpm-lock.yaml` 由 `pnpm install` 维护，`next-env.d.ts` 由 Next 生成，`.husky/_/` 由 husky 生成。

**解法**：不要手改。锁文件冲突的正确处理是接受一侧后重跑 `pnpm install`。这些文件已在 `.gitignore`／`.prettierignore` 中被相应处理。

### 坑 5：编辑器报错，但命令行是干净的

这个坑和前四个不同——**不是配置错了，是编辑器的缓存旧了**。所以单列在这里，因为排查顺序完全不一样。

**症状**：编辑器里一片红波浪线，比如说

```
找不到文件 "@repo/typescript-config/nextjs.json"
无法使用 JSX，除非提供了 "--jsx" 标志
```

但 `pnpm check-types` 是绿的。

**原因**：编辑器的 TypeScript 服务把模块解析结果缓存了。以下操作会让缓存失效，但它不一定会自己发现：

- `node_modules` 被删除重建
- 新增/删除 workspace 包（依赖布局变了）
- 改了某个 `tsconfig.json` 的 `extends`

第二条尤其典型：一个本来是独立工程的目录被接进 workspace 后，它在**接进来之前**解析不到 `@repo/...`，那个失败被缓存下来了；接进来之后符号链接有了，但缓存还在。

**解法**：

1. **先信命令行**。跑 `pnpm check-types`——绿的就说明代码没有问题，问题在编辑器。
2. **重启 TS 服务**：`Cmd+Shift+P` → `TypeScript: Restart TS Server`，或直接重载窗口。
3. **不要为了让报错消失去改 `tsconfig.json` 或源码**。那样做的结果通常是：编辑器满意了，命令行却真的坏了。

编辑器使用的 TypeScript 版本由 [`.vscode/settings.json`](../.vscode/settings.json) 的 `typescript.tsdk` 指向仓库锁定的那一份——如果编辑器右下角显示的不是工作区版本，点它切换一次。

## 怎么跟 AI 提需求

### 先搞清楚哪些是自动的

| 东西                         | 自动吗                       | 机制                                                                                                                                            |
| ---------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md` 里的规则         | **完全自动，一个字都不用提** | 会话启动时 Claude Code 读硬编码的 `CLAUDE.md`，里面的 `@AGENTS.md` 立即展开——从你第一句话起，规则就已经在上下文里了                             |
| `.agents/skills/` 里的 skill | **通常自动，但不保证**       | 常驻上下文里的只有每个 skill 的 `name` 与 `description`（约 100 词）。模型看你这句话像不像 description 里的触发短语，**自己决定**要不要载入正文 |

这条差别决定了提示词该怎么写：**规则不用提，skill 才可能值得提。**

skill 为什么不是必然自动？因为它是**模型决策，不是字符串匹配**。description 写得再准，也要模型愿意去调。

### 说什么话会命中哪个 skill

| 你会说的话                                                      | 命中               |
| --------------------------------------------------------------- | ------------------ |
| 「新建一个包」「建一个新 workspace」「scaffold packages/x-api」 | `add-workspace`    |
| 「加一个共享类型」「add a type to x-typings」                   | `add-shared-type`  |
| 「加一个组件到 ui 包」「wrap antd's Table」                     | `add-ui-component` |

这些短语就是从各 skill 的 `description` 里抄下来的——写 description 时按「用户真会这么说」来写，所以正常说话就够了。

### 三档提示词：以「加一个 Switch 组件」为例

**第一档 · 什么都不加**（大多数情况够用）

```
帮我给 ui 包加一个 Switch 组件
```

**第二档 · 加一句具体规则的提醒**（任务有歧义，或你发现它没照做时）

```
帮我给 ui 包加一个 Switch 组件。注意 barrel 要具名导出、
交互式组件加 "use client"、包装用 ComponentProps<typeof AntX> 保 ref 透传。
```

注意这里提醒的是**具体规则**，不是「读一下 AGENTS.md」。后者没用——规则已经在上下文里了。

**第三档 · 明确点名 skill**（重要改动，想要确定性）

```
按 add-workspace 的步骤新建 packages/x-api
用 add-ui-component 这个 skill 帮我封装 antd 的 Table
```

### 提示词里真正值得写的是这三类

1. **任务边界** —— 「只改 `packages/ui`，不要动 `apps/openrouter-web`」
2. **你担心的那条规则** —— 「注意应用不能直接 import antd」
3. **验收要求** —— 「改完跑 `pnpm lint` 和 `pnpm check-types`」

**第 3 类最值。** 因为 `AGENTS.md` 里那些硬规则本来就是机器强制的（见 [conventions.md](conventions.md) 里标 `[已强制]` 的条目）——让它跑一遍 lint，违规会自动暴露。**规范交给机器守，提示词只管说清你要什么**，这是这套东西的设计意图。

### 两条反模式

- **不要写「请先阅读 AGENTS.md」**。它已经通过 `CLAUDE.md` 的 import 进了上下文，再提一遍纯属浪费，还可能让模型以为要重新去读文件。
- **不要写「遵守项目规范」这类空话**。空泛的提醒不改变行为——要么点名具体规则，要么干脆不提，让 lint 去管。

### 怎么确认规则真的加载了

问它一句：**「AGENTS.md 里列了哪几条硬规则？」** 答不上来就是没加载——最常见的原因是首次那个 `@import` 授权弹窗被拒绝了，见 [`CLAUDE.md`](../CLAUDE.md) 里的说明。

## 目录速查

```
apps/openrouter-web/      唯一的应用（Next.js，:3002）
  app/(marketing)/        路由组：首页、/models、/editor；路由文件只 return 一个 feature 组件
  app/(dashboard)/        路由组：登录后的 /workspaces 及其子页
  features/<page>/        每页一个目录：index.tsx + index.module.scss + components/
  components/             跨页共用的壳：layout/、brand/、icons/
  styles/tokens.scss      设计令牌（:root 自定义属性），由 app/layout.tsx 引入一次
  lib/                    非组件逻辑：会话、provider 注册表、导航数据、格式化函数
packages/ui/              UI 层，封装 antd —— 子应用从这里取组件
packages/x-editor/        3D 编辑器核心（r3f + three + zustand）；消费方自己负责 ssr:false
packages/x-typings/       共享类型，Zod schema 为唯一来源
packages/eslint-config/   ESLint 配置，三个入口：base / react-library / next-js
packages/typescript-config/  tsconfig 基座，四个：base / bundler / nextjs / react-library

docs/architecture.md      为什么这样设计
docs/conventions.md       逐条规范与强制状态

AGENTS.md                 AI 编码规范的唯一来源（各工具都读这一份）
CLAUDE.md                 只是 @AGENTS.md 的指针，不要在这里写规则
.agents/skills/           skill 真身（开放标准，Codex 等直接读）
.claude/skills            → 指向 .agents/skills 的符号链接（Claude Code 专用）
```

## 接下来读什么

1. [architecture.md](architecture.md) —— 理解依赖方向与各包的职责边界
2. [conventions.md](conventions.md) —— 动手前扫一遍，尤其看 `[已强制]` 的条目
3. 你要改的那个包自己的 `README.md`，以及 `AGENTS.md` 里对应的 **Per-workspace rules** 小节
