import { reactLibraryConfig } from "@repo/eslint-config/react-library";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactLibraryConfig,

  // 本包确实依赖 antd，所以 base 里的 import/no-extraneous-dependencies 拦不住下面这类用法
  // ——那条规则只看「有没有声明」，而 antd 是声明了的。所以这里单独禁掉。
  //
  // 只列 message / notification，不列 Modal：barrel 合法地再导出了 antd 的 Modal 组件供
  // 声明式使用，禁掉会误伤。而 Modal.confirm() 这类静态调用是 import 规则查不到的，
  // 只能留在约定层面（见 README.md）。
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "antd",
              importNames: ["message", "notification"],
              message:
                "用 App.useApp() 取 message / notification，不要从 antd 引静态方法——静态方法在 React 树外，拿不到 ConfigProvider 的主题，React 19 下还会告警。",
            },
          ],
        },
      ],
    },
  },
];
