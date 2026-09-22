// @repo/ui —— 子应用组件引入的唯一入口。
//
// 分三部分：
//   1. 自有组件与主题（./button、./provider、./theme）
//   2. 从 antd 再导出的常用组件 —— 应用不直接依赖 antd，将来换主题或换库只改这一个文件
//   3. 刻意不导出 antd 的 Card：模板遗留的 ./card 导出的是另一个同名 stub 组件（一个 <a>），
//      两个 Card 同时暴露会造成重名混淆。删掉 card.tsx 之后即可补上。
//
// 逐个具名再导出而不是 `export * from "antd"`，是为了让引入面可控，也方便打包器摇树。

export { Button, type ButtonProps } from "./button";
export { UiProvider } from "./provider";
export { theme } from "./theme";

export {
  Alert,
  App,
  Flex,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
