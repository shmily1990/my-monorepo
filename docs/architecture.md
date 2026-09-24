# 架构

本文件说明这个 monorepo **为什么**是现在这个形状。各包「是什么、怎么用」在它们自己的 `README.md` 里，规范条目在 [conventions.md](conventions.md)。

Why this monorepo is shaped the way it is. What each package _is_ and _how to use it_ lives in that package's `README.md`; the rule list is in [conventions.md](conventions.md).

## 依赖方向

```
            apps/openrouter-web            Next.js 16 · React 19
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   ┌────────────────┐    ┌──────────────────┐
   │  @repo/ui      │    │ @repo/x-typings  │
   │  antd 封装层    │    │ zod schema 与类型 │
   └────────────────┘    └──────────────────┘

  以下两个包被所有包以 devDependencies 引用，不参与运行时：
      @repo/eslint-config      @repo/typescript-config
```

规则只有一条：**箭头是单向的，且没有任何箭头指向 `apps/*`**。应用依赖库，库不知道应用的存在。

注意 `@repo/ui` 与 `@repo/x-typings` 之间**没有边**。它们互不依赖，各自独立。这并非刻意设计，但目前是事实——如果将来出现了它们互相需要的场景，需要先想清楚是哪一层的职责，而不是直接加依赖。

## 每个包为什么存在

**`apps/openrouter-web`** —— 唯一的应用。它是**消费者**：所有可复用的东西都应该下沉到 `packages/`，应用本身只留路由、页面与业务编排。

**`packages/ui`** —— 存在的理由是**让应用不依赖 antd**。如果应用直接 `import { Button } from "antd"`，那么：换 UI 库要改所有用到的地方；主题会散落在各处；antd 版本可能出现多份。把这层封装收在一个包里，主题、locale、antd 版本就只有一处可改——而且将来加第二个应用时，它天然继承同一套主题与版本约束。

它的公开面刻意是**策展式**的——`src/index.ts` 逐个具名再导出（`export { Button, Card, ... } from "antd"`），而不是 `export * from "antd"`。这样「我们对外承诺了什么」是一份可读的清单，而不是 antd 的全部 API。

**`packages/x-typings`** —— 存在的理由是**让类型有唯一的事实来源**。跨包共享的类型若各自手写，运行时校验和编译期类型会漂移。这里用 Zod schema 作为唯一来源，TS 类型由 `z.infer` 推导，两者不可能不一致。

**`packages/eslint-config` / `packages/typescript-config`** —— 把「这个仓库怎么写代码」从各个包里抽出来。它们本身没有源码，只有配置。

## 为什么是源码消费

`packages/ui` 与 `packages/x-typings` 的 `exports` 直接指向 `./src`，**没有 `dist/`、没有 build 脚本、没有 Turbo build 任务**。消费方的打包器直接编译这些源码。

代价是消费方必须能编译 TS（Next.js 可以，这是本仓库唯一的应用）。换来的是：

- **不会出现陈旧的 dist**。构建产物一旦存在，就必然会有「改了源码但忘了构建，于是类型错误来自旧产物」的时刻。源码消费让这类问题不可能发生。
- **不需要维护任务依赖顺序**。没有 build，就没有「A 必须先于 B 构建」的图要维护。
- **编辑器跳转直达源码**，而不是 `.d.ts`。

Turbo 的 `build` 任务因此只对 `apps/openrouter-web` 执行——这不是配置遗漏，是设计结果。

## 为什么 ESLint 分三个入口

`@repo/eslint-config` 导出 `base` / `react-library` / `next-js` 三个入口，而不是一份配置加 `files` 匹配：

| 入口            | 用于                             | 含                                          |
| --------------- | -------------------------------- | ------------------------------------------- |
| `base`          | 非 React 的包（`x-typings`）     | JS/TS 规则、import 校验、Turbo 环境变量校验 |
| `react-library` | React 组件库（`ui`）             | `base` + React + React Hooks                |
| `next-js`       | Next.js 应用（`openrouter-web`） | `react-library` + Next 规则                 |

**为什么用入口分发而不是 `files` 匹配**：入口分发**失败是响亮的**——`packages/ui` 用 `react-library`，它就不可能拿到 Next 规则，因为那些规则根本不在它引入的模块里。而 `files` 匹配是**静默失败**的：一条 glob 写错，规则就悄悄不生效了，没人会发现。

这条设计有一个直接的后果值得知道：**「Next 规则只作用于 Next 应用」是被入口保证的，不是被配置保证的**。如果有人把 `packages/ui` 的入口改成 `next-js`，没有任何东西会拦住他——所以这条写进了 `AGENTS.md`。

## 为什么 tsconfig 分三档

`@repo/typescript-config` 的四份配置是继承链，不是并列选项：

```
base.json                 NodeNext · strict · noUncheckedIndexedAccess
└── bundler.json          + ESNext/Bundler · noEmit
    ├── nextjs.json       + jsx preserve · allowJs · next 插件
    └── react-library.json + jsx react-jsx
```

`base.json` 用 `NodeNext`，这对「被 Node 解析的库」是正确的。但打包器消费的代码需要 `Bundler` 解析（允许无扩展名相对导入），`bundler.json` 就是这一档。`nextjs.json` 与 `react-library.json` 都从它继承。

**为什么 `bundler.json` 是独立一档，而不是各个包各自覆盖。** 在它出现之前，`nextjs.json` 存在的主要原因就是替应用做这一处覆盖，而 `packages/x-typings` 只能在自己的 tsconfig 里复制一份 —— 那与「所有 tsconfig 都住在 `typescript-config`」的约定相抵触。真正的触发点是 `packages/x-editor`：一个 `react-library.json`（即 `NodeNext`）的包，第一次 import 了 `@repo/x-typings`（`"type": "module"`）。类型检查会把后者的**源码**拉进一个 `NodeNext` 程序，于是 `TS2835` 报在 x-typings 自己的 barrel 上 —— 一个本身毫无问题的文件。这不是巧合而是结构性的：任何被打包器编译、又依赖 `"type": "module"` 兄弟包的包都会撞上。所以修在共享的那一档，`x-typings` 的局部覆盖也随之删掉了。

## 边界今天被保护得如何

这是理解本仓库现状最重要的一段。

强制机制分两代。**第一代是「碰巧」**——它们不是因为要保护架构而存在的，只是恰好有这个副作用：

| 机制                             | 实际约束                    | 可绕过性                           |
| -------------------------------- | --------------------------- | ---------------------------------- |
| husky `pre-commit` → lint-staged | 暂存文件的 lint 与格式      | `git commit --no-verify` 直接跳过  |
| pnpm 隔离式 `node_modules`       | 未声明的依赖无法解析        | 写相对路径绕过（已被下面一条堵住） |
| ESLint `projectService`          | 被 lint 的包必须有 tsconfig | 不算绕过，是设计                   |

**第二代是「为边界设计的」**，也是现在真正在拦东西的那一层：

| 规则                                | 在哪                             | 拦什么                                                                     |
| ----------------------------------- | -------------------------------- | -------------------------------------------------------------------------- |
| `import/no-extraneous-dependencies` | `packages/eslint-config/base.js` | import 了没在最近 `package.json` 里声明的包                                |
| `import/no-relative-packages`       | 同上                             | 用相对路径跨包 import                                                      |
| `no-restricted-imports`             | 各包的 `eslint.config.*`（内联） | 该包特有、且「已声明但不该用」的 import（如 `packages/ui` 里的 `message`） |
| `engine-strict` / `save-exact`      | 根 `.npmrc`                      | Node 版本不符、新增依赖带 caret                                            |

`import/no-extraneous-dependencies` 一条覆盖了多条架构约定，因为它的判据是「有没有声明」而不是包名——`antd` 只声明在 `packages/ui`，所以应用 import 它就会报错；`@ant-design/nextjs-registry` 只声明在应用，所以 `packages/ui` import 它就会报错。

它还有一个别的规则都没有的性质：**它按被检查文件的位置向上找 `package.json`，不用 `process.cwd()`**。本仓库其他 lint 机制都困在 cwd 陷阱里（见 [getting-started.md](getting-started.md) 坑 2），唯独它免疫——从仓库根跑、在 IDE 里跑，结果都对。

**最大的洞：没有 CI。** husky 钩子是唯一的自动屏障，而 `git commit --no-verify` 能整个绕过它。所以严格说，上面所有 lint 规则都是**本地自愿遵守**的——它们拦住的是「不小心的违规」，不是「决意要绕过的人」。补这个洞需要把 CI 设为 required check，见 [conventions.md](conventions.md) 里仍标着 `[待强制]` 的条目（依赖方向中的包名部分、新增 workspace 的完整性校验等），它们的落点是 **`turbo boundaries`**（本机 turbo 2.11.2 已确认存在该命令，且**无需任何 tag 配置**就能检查「相对路径跳出包目录」与「import 未声明的包」）。

## 相关文档

- 逐条规范与强制状态 —— [conventions.md](conventions.md)
- 上手与常见陷阱 —— [getting-started.md](getting-started.md)
- AI 编码规范的唯一来源 —— [`AGENTS.md`](../AGENTS.md)
