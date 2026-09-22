import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

/**
 * React 规则层，供 react-library.js 与 next.js 复用。
 *
 * 不通过 exports 对外暴露 —— 消费方应该引入 ./react-library 或 ./next-js。
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const reactConfig = [
  // 使用插件提供的 flat 预设，而不是展开旧版 configs.recommended.rules。
  // 旧版格式不会配置 languageOptions，且缺少 jsx-runtime —— 在 React 17+
  // 会导致 react/react-in-jsx-scope、react/jsx-uses-react 全量误报。
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],

  // 同样用 flat 预设：它自带 plugins 注册，只展开 .rules 会报
  // "could not find plugin react-hooks"
  reactHooksPlugin.configs.flat["recommended-latest"],

  {
    settings: {
      // 不指定会对每个文件按极老的 React 版本判定
      react: { version: "detect" },
    },
    rules: {
      // R3F 会往 JSX 上挂 three.js 的 mesh 属性，这里放行常用的那些。
      // 注意：白名单不完整，接入 react-three-fiber 后需按实际用到的属性补全。
      "react/no-unknown-property": [
        "error",
        {
          ignore: [
            "position",
            "rotation",
            "scale",
            "args",
            "attach",
            "material",
            "geometry",
            "castShadow",
            "receiveShadow",
            "metalness",
            "roughness",
            "intensity",
          ],
        },
      ],
    },
  },
];
