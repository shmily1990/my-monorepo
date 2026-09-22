// @repo/ui —— 子应用组件引入的唯一入口。
//
// 分两部分：
//   1. 自有组件与主题（./button、./provider、./theme）
//   2. 从 antd 再导出的常用组件 —— 应用不直接依赖 antd，将来换主题或换库只改这一个文件
//
// 逐个具名再导出而不是 `export * from "antd"`，是为了让引入面可控，也方便打包器摇树。
// 新增再导出时请一并更新 README.md 的导出清单。

export { Button, type ButtonProps } from "./button";
export { UiProvider } from "./provider";
export { theme } from "./theme";

export {
  Alert,
  App,
  Avatar,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  Empty,
  Flex,
  Input,
  Layout,
  Menu,
  Modal,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
