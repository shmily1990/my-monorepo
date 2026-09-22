import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,

  // base 里的 import/no-extraneous-dependencies 已经能拦住「应用 import antd」——antd 不在
  // 本包的 dependencies 里。但那条例的报错文案是 "Run 'npm i -S antd' to add it"，
  // **等于在教人把违规坐实**。对人是误导，对 AI 是直接把错误修法喂到嘴边。
  //
  // 所以这里显式再禁一次，给出正确指引。代价是同一处会报两条 error，可以接受：
  // 一条说了"没声明"，另一条说清"为什么不能声明"。
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "antd",
              message:
                "应用不得直接依赖 antd。组件从 @repo/ui 引入；需要的组件还没被再导出时，往 packages/ui/src/index.ts 的导出清单里加一个，而不是在这里绕过。",
            },
          ],
        },
      ],
    },
  },
];
