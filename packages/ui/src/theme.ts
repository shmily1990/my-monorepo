import type { ThemeConfig } from "antd";

/**
 * 全局主题，所有子应用共用这一份。
 *
 * 这是整个仓库唯一的主题入口 —— 不要在应用里各写各的 ConfigProvider theme。
 */
export const theme: ThemeConfig = {
  token: {
    /**
     * 品牌主色。
     *
     * 来源：从设计参照图 docs/openrouter.jpg 采样得到，不是官方色值文档。
     * 做法是把 JPEG 转成未压缩 BMP 后直接读像素，取图中三处紫色元素（Sign Up 按钮、
     * Get API Key 按钮、logo 方块）各自区域内出现次数最多的颜色 —— 三处结果一致，
     * 都是 #7624F3，因此可以确认这就是该界面的主色。
     */
    colorPrimary: "#7624f3",

    // 参照图里的按钮与卡片比 antd 默认的 6px 更圆一些。
    borderRadius: 8,
  },
};
