import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import turboPlugin from "eslint-plugin-turbo";
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

  // TS 规则：覆盖 tseslint.configs.recommended 的默认值（它将这两条设为 error）
  {
    files: TS_FILES,
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
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
