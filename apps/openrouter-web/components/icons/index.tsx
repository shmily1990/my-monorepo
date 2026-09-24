import type { ReactNode } from "react";

/*
 * UI 图标集 —— 全部手写内联 SVG。
 *
 * 为什么是内联 SVG 而不是图片资源：
 *   1. 仓库里没有 public/，也没有任何图片文件；</img>/next/image 都需要额外的资源配置。
 *   2. `@next/next/no-img-element` 是 warn，而 lint 跑的是 `--max-warnings 0`，
 *      所以裸 <img> 直接就是 lint 失败。
 *   3. next/font/google 因为「构建期联网」被根 layout 明确否决，同样的理由不引入图标 CDN。
 * 内联 SVG 不需要任何文件、不需要 next.config 配置、跟随 currentColor 取色、可被摇树。
 *
 * 三个容易踩的约束：
 *   - JSX 里的 SVG 属性必须 camelCase（strokeWidth / strokeLinecap / clipPath / fillRule）。
 *     `react/no-unknown-property` 是 error，从设计工具粘过来的 kebab-case 属性会直接报错。
 *   - 这些组件不含 hooks，**不需要 "use client"**，可以放心用在服务端组件里。
 *   - 尺寸走 size，颜色走 currentColor —— 所以每个图标都不需要自己的 .module.scss。
 */

type IconProps = {
  size?: number;
  className?: string;
};

/** 线性图标的公共外壳。所有描边图标都由它渲染，避免每个图标重复一遍属性。 */
function StrokeIcon({
  size = 16,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </StrokeIcon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </StrokeIcon>
  );
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m18 15-6-6-6 6" />
    </StrokeIcon>
  );
}

/** 排序：参考图工具栏「Newest」前面的上下箭头。 */
export function SortIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M7 19V5" />
      <path d="m4 8 3-3 3 3" />
      <path d="M17 5v14" />
      <path d="m14 16 3 3 3-3" />
    </StrokeIcon>
  );
}

/** 层叠：参考图工具栏「All…」前面的图标。 */
export function LayersIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </StrokeIcon>
  );
}

/** 星标。Pinned 选中时用 filled 变成实心。 */
export function StarIcon({
  filled = false,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <StrokeIcon {...props}>
      <path
        d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6Z"
        fill={filled ? "currentColor" : "none"}
      />
    </StrokeIcon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11.5v5" />
      <path d="M12 7.8h.01" />
    </StrokeIcon>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M4.6 6h.01" />
      <path d="M4.6 12h.01" />
      <path d="M4.6 18h.01" />
    </StrokeIcon>
  );
}

export function TableIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M9 10v10" />
    </StrokeIcon>
  );
}

/** Compare 按钮前面的柱状图。 */
export function BarChartIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 20v-6" />
      <path d="M12 20V5" />
      <path d="M19 20v-9" />
    </StrokeIcon>
  );
}

/**
 * 「Discover Models」按钮后面的代币标记。
 * 参考图里是两枚重叠的圆形，这里用两个错位圆还原那个形状。
 */
export function CoinIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="9.5" cy="12" r="6" />
      <circle cx="14.5" cy="12" r="6" />
    </StrokeIcon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 3 5 6v6c0 4.2 2.9 7.7 7 9 4.1-1.3 7-4.8 7-9V6l-7-3Z" />
    </StrokeIcon>
  );
}

export function PadlockIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
    </StrokeIcon>
  );
}

/** 信任卡里的绿色对勾。圆是实心 currentColor，勾用白色描边。 */
export function CheckCircleIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path
        d="m8.4 12.2 2.4 2.4 4.8-5"
        fill="none"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 盾牌里的「一组人」。 */
export function PeopleIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.8 18.5a5.2 5.2 0 0 1 10.4 0" />
      <circle cx="17" cy="9.5" r="2.5" />
      <path d="M15.2 18.5a4.6 4.6 0 0 1 5-4.4" />
    </StrokeIcon>
  );
}

/** 图表卡右上角的拖拽手柄（六个点）。 */
export function GripIcon({ size = 16, className }: IconProps) {
  const dots: readonly (readonly [number, number])[] = [
    [9, 5],
    [15, 5],
    [9, 12],
    [15, 12],
    [9, 19],
    [15, 19],
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {dots.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={1.4}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

/** 模型名后面的「视力」标记 —— 参考图里那个望远镜形状。 */
export function VisionIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="6.5" cy="14.5" r="3.5" />
      <circle cx="17.5" cy="14.5" r="3.5" />
      <path d="M10 14.5h4" />
    </StrokeIcon>
  );
}

/** 模型名后面的「批处理」标记。 */
export function BatchIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M8.5 5.5h10a2 2 0 0 1 2 2v10" />
    </StrokeIcon>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m9 8-4 4 4 4" />
      <path d="m15 8 4 4-4 4" />
    </StrokeIcon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </StrokeIcon>
  );
}

/* ---------------------------------------------------------------------------
 * 模态图标。既用于侧栏「Input modalities」下的勾选项，也用于主列的模态页签。
 * ------------------------------------------------------------------------- */

export function TextModalityIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 6.5h14" />
      <path d="M12 6.5V18" />
    </StrokeIcon>
  );
}

export function ImageModalityIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m4 19 5.5-5.5 3.5 3.5 3-3L20 18" />
    </StrokeIcon>
  );
}

export function VideoModalityIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="m15 11 6-3.5v9L15 13v-2Z" />
    </StrokeIcon>
  );
}

export function AudioModalityIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M9 17V5.5l10-2V16" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </StrokeIcon>
  );
}

export function FileModalityIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M14 3H7.5A2.5 2.5 0 0 0 5 5.5v13A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V8l-5-5Z" />
      <path d="M14 3v5h5" />
    </StrokeIcon>
  );
}

/** 语音合成：喇叭。 */
export function SpeechModalityIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 10v4h3l4 3.5v-15L7 10H4Z" />
      <path d="M15 9.5a4 4 0 0 1 0 5" />
      <path d="M17.8 7a7.5 7.5 0 0 1 0 10" />
    </StrokeIcon>
  );
}

/** 语音识别：麦克风。 */
export function TranscriptionModalityIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3" />
    </StrokeIcon>
  );
}

/** 向量嵌入：一个小型节点网络。 */
export function EmbeddingsModalityIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="2" />
      <circle cx="5" cy="6" r="1.8" />
      <circle cx="19" cy="6" r="1.8" />
      <circle cx="12" cy="20" r="1.8" />
      <path d="m6.5 7.2 4 3.4" />
      <path d="m17.5 7.2-4 3.4" />
      <path d="M12 14v4.2" />
    </StrokeIcon>
  );
}

/** 重排序：上下箭头。 */
export function RerankModalityIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M8 20V5" />
      <path d="m5 8 3-3 3 3" />
      <path d="M16 4v15" />
      <path d="m13 16 3 3 3-3" />
    </StrokeIcon>
  );
}

/** 决策：菱形。 */
export function DecisionsModalityIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 3.5 20 12l-8 8.5L4 12l8-8.5Z" />
      <path d="M4 12h16" />
    </StrokeIcon>
  );
}

/* ---------------------------------------------------------------------------
 * 侧栏筛选分组的图标。
 * ------------------------------------------------------------------------- */

/** Input modalities：一个方框配一支箭头，表示「输入」。 */
export function InputsIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3" y="3.5" width="7" height="7" rx="1.8" />
      <path d="M11 7h7" />
      <path d="m15.5 4.5 3 2.5-3 2.5" />
      <path d="M5 15h5" />
      <rect x="13" y="14" width="8" height="7" rx="1.8" />
      <path d="M5 18h5" />
    </StrokeIcon>
  );
}

/** Discounted：百分号。语义直白，比画一个「桶」更可读。 */
export function PercentIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M19 5 5 19" />
      <circle cx="7.5" cy="7.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </StrokeIcon>
  );
}

/** Context length：尺子。 */
export function RulerIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="2.5" y="8" width="19" height="8" rx="1.8" />
      <path d="M7 8v3" />
      <path d="M11.5 8v4" />
      <path d="M16 8v3" />
    </StrokeIcon>
  );
}

/** Prompt pricing：带 $ 的圆。 */
export function DollarIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5v11" />
      <path d="M14.8 9.4A2.6 2.6 0 0 0 12.4 8h-.8a2.2 2.2 0 0 0 0 4.4h1.2a2.2 2.2 0 0 1 0 4.4h-.9a2.6 2.6 0 0 1-2.4-1.4" />
    </StrokeIcon>
  );
}

/** Series：标签。 */
export function TagIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M3.5 12.6 12 4h7a1 1 0 0 1 1 1v7l-8.6 8.5a1.4 1.4 0 0 1-2 0l-6-6a1.4 1.4 0 0 1 .1-1.9Z" />
      <circle cx="16" cy="8" r="1.3" />
    </StrokeIcon>
  );
}

/** Categories：四宫格。 */
export function GridIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.8" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.8" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.8" />
    </StrokeIcon>
  );
}

/** Supported parameters：推子。 */
export function SlidersIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 7h8" />
      <path d="M17 7h3" />
      <path d="M4 12h4" />
      <path d="M13 12h7" />
      <path d="M4 17h11" />
      <path d="M20 17h0" />
      <circle cx="14.5" cy="7" r="2.2" />
      <circle cx="10.5" cy="12" r="2.2" />
      <circle cx="17.5" cy="17" r="2.2" />
    </StrokeIcon>
  );
}

/** Distillable：一滴液体，比抽象图形更贴合「蒸馏」的语义。 */
export function DropletIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 3s6 6.8 6 10.6a6 6 0 0 1-12 0C6 9.8 12 3 12 3Z" />
    </StrokeIcon>
  );
}

/** Zero data retention：被划掉的圆。 */
export function BanIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.8 5.8 12.4 12.4" />
    </StrokeIcon>
  );
}

/** 收尾 CTA 与推理徽标共用的对勾。 */
export function CheckIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </StrokeIcon>
  );
}

/* ---------------------------------------------------------------------------
 * 账号与 dashboard 侧栏用的图标。
 * 侧栏那 17 个条目里，不少复用了上面已有的图标（Overview→GridIcon、
 * Guardrails→ShieldIcon、Presets→SlidersIcon、Activity→BarChartIcon、
 * Logs→ListIcon、Files→FileModalityIcon），只在语义对不上时才新增。
 * ------------------------------------------------------------------------- */

/** 默认头像里的那个人形轮廓。 */
export function UserIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.6 20.5a7.4 7.4 0 0 1 14.8 0" />
    </StrokeIcon>
  );
}

/** 头像右下角那个「可换头像」的相机徽标。 */
export function CameraIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="2.5" y="7" width="19" height="13" rx="2.5" />
      <path d="m8.5 7 1.4-2.5h4.2L15.5 7" />
      <circle cx="12" cy="13" r="3.4" />
    </StrokeIcon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M2 12s3.7-6.5 10-6.5S22 12 22 12s-3.7 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </StrokeIcon>
  );
}

/** 密码可见性切换的「已可见」态。 */
export function EyeOffIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M10.6 6.1a10.7 10.7 0 0 1 1.4-.1c6.3 0 10 6.5 10 6.5a17.2 17.2 0 0 1-3 3.6" />
      <path d="M6.4 7.6A17.2 17.2 0 0 0 2 12s3.7 6.5 10 6.5a10.6 10.6 0 0 0 3.4-.5" />
      <path d="m3 3 18 18" />
    </StrokeIcon>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="7.5" cy="15.5" r="3.5" />
      <path d="M10 13 20 3" />
      <path d="m17.5 5.5 2.5 2.5" />
      <path d="m15 8 2.5 2.5" />
    </StrokeIcon>
  );
}

/** BYOK：把自带密钥放进这个平台。 */
export function BringKeyIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <circle cx="9" cy="12" r="2.6" />
      <path d="M11.6 12H19" />
      <path d="M16 9.4V12" />
    </StrokeIcon>
  );
}

export function RouteIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 6h4.5a4 4 0 0 1 4 4v4a4 4 0 0 0 4 4H20" />
      <circle cx="4" cy="6" r="2" />
      <circle cx="20" cy="18" r="2" />
    </StrokeIcon>
  );
}

/** Tools：一个工具箱，比拼一套扳手更好画也更好认。 */
export function ToolboxIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="2.5" y="8" width="19" height="12" rx="2.5" />
      <path d="M8.5 8V6.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V8" />
      <path d="M2.5 13.5h19" />
    </StrokeIcon>
  );
}

/** Observability：一条活动曲线。 */
export function PulseIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M2.5 12h4L9 5.5l4 13 2.5-6.5h6" />
    </StrokeIcon>
  );
}

/** Classifiers：一张带文本行的卡片。 */
export function LabelIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M6.5 9.5h5" />
      <path d="M6.5 14.5h9" />
    </StrokeIcon>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.6" />
      <path d="M12 18.9v2.6" />
      <path d="M2.5 12h2.6" />
      <path d="M18.9 12h2.6" />
      <path d="m5.2 5.2 1.9 1.9" />
      <path d="m16.9 16.9 1.9 1.9" />
      <path d="m18.8 5.2-1.9 1.9" />
      <path d="m7.1 16.9-1.9 1.9" />
    </StrokeIcon>
  );
}

/** Credits：一张卡。 */
export function CardIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6 14.5h4" />
    </StrokeIcon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M18 8.6a6 6 0 0 0-12 0c0 5-2 6.4-2 6.4h16s-2-1.4-2-6.4Z" />
      <path d="M13.7 18.5a2 2 0 0 1-3.4 0" />
    </StrokeIcon>
  );
}

/* ---------------------------------------------------------------------------
 * API Keys 页用到的图标。
 * Disable 复用上面的 BanIcon（划掉的圆）、Activity 与 Logs 复用 BarChartIcon / ListIcon，
 * 只在语义对不上时才新增。
 * ------------------------------------------------------------------------- */

export function PlusIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </StrokeIcon>
  );
}

/** 行操作菜单里的 Edit。 */
export function PencilIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m15.5 6.5 3 3" />
    </StrokeIcon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4 7h16" />
      <path d="M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12" />
      <path d="M10.5 11v6" />
      <path d="M13.5 11v6" />
    </StrokeIcon>
  );
}

/** 详情页面包屑前面那个返回箭头。 */
export function ArrowLeftIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </StrokeIcon>
  );
}

/** 详情页 meta 行里的创建日期。 */
export function CalendarIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17" />
      <path d="M8 3.5V6" />
      <path d="M16 3.5V6" />
    </StrokeIcon>
  );
}

/** 表格行尾那个竖向的「更多」按钮（⋮）。与 GripIcon 的六个点不同，这个只有三个点。 */
export function MoreVerticalIcon({ size = 16, className }: IconProps) {
  const dots = [6, 12, 18];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {dots.map((cy) => (
        <circle key={cy} cx={12} cy={cy} r={1.7} fill="currentColor" />
      ))}
    </svg>
  );
}
