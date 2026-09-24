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
      /*
       * R3F 会往 JSX 上挂 three.js 的属性，这里放行用到的那些。
       *
       * 为什么需要这份名单：R3F 的元素按约定是**小写**的（`<mesh>`、`<points>`、
       * `<ambientLight>`…），而 JSX 把小写标签当 DOM 元素，于是
       * `react/no-unknown-property` 会拿浏览器的 HTML 属性表去校验 `args`、`intensity`
       * 这些 three.js 的东西，全部判为未知属性。大写开头的组件（`<OrbitControls>`）不受影响 ——
       * 自定义组件的 props 这条规则不查。
       *
       * **这份名单要跟着用法长。** 报错信息是 "Unknown property 'x' found"，把那个名字
       * 加进来即可；但先想一想它是不是真的该出现在 JSX 上。名单不完整不会静默失效 ——
       * 它只会多报，所以漏一项就是一次明确的报错，不存在"悄悄放过"的风险。
       */
      "react/no-unknown-property": [
        "error",
        {
          ignore: [
            // 变换与渲染顺序
            "position",
            "rotation",
            "scale",
            "up",
            "renderOrder",
            "frustumCulled",
            "visible",
            "matrixAutoUpdate",
            // 构造、挂载与释放
            "args",
            "attach",
            "material",
            "geometry",
            "dispose",
            // 相机与控制器
            "makeDefault",
            "near",
            "far",
            "target",
            "enableDamping",
            // 光照与材质
            "intensity",
            "color",
            "metalness",
            "roughness",
            "size",
            "sizeAttenuation",
            "vertexColors",
            "wireframe",
            "transparent",
            "opacity",
            // 阴影
            "castShadow",
            "receiveShadow",
          ],
        },
      ],
    },
  },
];
