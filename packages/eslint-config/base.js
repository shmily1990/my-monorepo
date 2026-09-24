import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

/** TypeScript 文件匹配范围，tseslint 自己的配置也用的是这一组 */
const TS_FILES = ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"];

/**
 * 仓库共享的 ESLint 内核。
 *
 * 只包含与框架无关的部分：JS/TS 基础规则、import 校验、Turborepo 环境变量校验。
 * React 相关规则在 ./react.js，Next.js 相关规则在 ./next.js —— 这两个文件都建立在本文件之上，
 * 所以「Next 规则只作用于 Next 应用」是靠入口分发保证的，不需要 files 匹配。
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const baseConfig = [
  js.configs.recommended,

  // 关闭与 TS 冲突的核心规则（no-undef、no-unreachable 等）。
  // 必须排在 js.configs.recommended 之后，否则会被它重新打开。
  tseslint.configs.eslintRecommended,

  ...tseslint.configs.recommended,

  // 全局环境变量。browser 与 node 同时放开是刻意为之：同一个仓库里既有浏览器侧代码
  // 也有构建期代码，代价是 Node 侧写 window 不会报错。
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 类型感知 lint。
  // tsconfigRootDir 取 process.cwd()：turbo 以各 workspace 为 cwd 执行 lint，
  // 因此每个包都会解析到自己的 tsconfig.json，而不是仓库根目录。
  {
    files: TS_FILES,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
  },

  // TS 规则：覆盖 tseslint.configs.recommended 的默认值
  {
    files: TS_FILES,
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      /*
       * 未使用的 import 交给 unused-imports —— 与 @typescript-eslint/no-unused-vars 的
       * 关键差别是它**可自动修复**：`eslint --fix`（以及编辑器保存时的
       * source.fixAll.eslint、提交钩子里的 lint-staged）会把多余的 import 直接删掉，
       * 而原规则只能报告、改不了。
       *
       * 两条必须成对出现，少一条都会出问题：
       *
       * 1. **原规则必须关掉。** 这个插件是在 no-unused-vars 之上做拆分的
       *    （插件 README：it composes the rule `no-unused-vars` of either the typescript
       *    or js plugin）。原规则与它的分叉同时开着，同一个未使用变量会被报两次，
       *    而且两条的修复行为会互相干扰。
       *
       * 2. **关掉之后，未使用的「变量」要靠 unused-imports/no-unused-vars 接手。**
       *    只加 no-unused-imports 而不加这一条，非 import 的未使用变量就再也没有规则管了 ——
       *    检查会**静默消失**，不会有任何提示。这是这次改动里最容易漏、也最危险的一步。
       *
       * 选项用的是插件 README 的推荐值。相比改动前的 `{ argsIgnorePattern: "^_" }`，
       * 多了一条 `varsIgnorePattern: "^_"`：**行为差异在这里** —— `_` 开头的未使用局部变量
       * 从此不再告警（此前只有函数参数享受这个豁免）。这属于放宽，去掉那一行即可还原。
       */
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  // import 校验 + TS 路径别名解析
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          // project 只接受路径 / glob / 数组，不接受 true
          project: ["apps/*/tsconfig.json", "packages/*/tsconfig.json"],
        },
      },
    },
    rules: {
      "import/no-duplicates": "error",
      "import/order": [
        "warn",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
        },
      ],

      // 架构边界的主力规则：不许 import 一个没在最近 package.json 里声明的包。
      //
      // 它一条就覆盖了多条架构约定，因为判定依据是「有没有声明」而不是包名：
      //   - 应用不得直接依赖 antd（antd 只在 packages/ui 的 dependencies 里）
      //   - packages/ui 不得引入 @ant-design/nextjs-registry（不在它的依赖里）
      //   - 应用不得自己写 ConfigProvider theme（ConfigProvider 没从 barrel 导出，
      //     只能从 antd 拿，于是被上面那条顺带拦下）
      //   - x-typings 不得引入 react（不在它的依赖里）
      //
      // 为什么这条规则在本仓库格外可靠：读 eslint-plugin-import 源码可知，未传
      // packageDir 时它走 pkgUp({ cwd: getPhysicalFilename(context) })，即
      // **从被检查文件的位置向上找 package.json，不用 process.cwd()**。
      // 本仓库其他所有 lint 机制都被 cwd 陷阱困扰（flat config 从 cwd 向上找配置、
      // @next/next 找不到 pages、projectService 同时看到多个 tsconfig），唯独这条免疫——
      // 从仓库根跑、在 IDE 里跑，结果都正确。
      //
      // 选项取宽松档（devDependencies / peerDependencies 视为已声明），只拦「哪都没声明」。
      // 想更严可以把它们改成文件模式数组，只允许 *.config.* 之类的文件导入 devDependencies。
      "import/no-extraneous-dependencies": [
        "error",
        { devDependencies: true, peerDependencies: true },
      ],

      // 拦「用相对路径跨包 import」，例如 ../../packages/ui/src/button。
      // 正确写法是用包名 @repo/ui。turbo boundaries 也查这一项，这条让本地立刻看到反馈。
      "import/no-relative-packages": "error",
    },
  },

  // Turborepo：检查未声明环境变量
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "error",
    },
  },

  // 关闭与 Prettier 冲突的格式化规则。放在最后，确保不被前面的预设重新打开。
  // 格式化本身由根目录的 `pnpm format` 负责，不经过 ESLint。
  eslintConfigPrettier,

  // 全局忽略目录（所有子包统一忽略）
  {
    ignores: [
      "node_modules",
      "dist",
      ".next",
      ".turbo",
      "build",
      "out",
      "next-env.d.ts", // Next 自动生成，内含 triple-slash reference
    ],
  },
];
