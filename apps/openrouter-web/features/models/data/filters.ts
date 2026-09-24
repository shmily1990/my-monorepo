import { getProvider } from "@/lib/providers";

import type { Modality, Model } from "../model";
import { MOCK_MODELS } from "./mock-models";

/**
 * 侧栏筛选与工具栏选项。
 *
 * 每条筛选项自带一个 `test` 谓词。把判定逻辑放在数据里（而不是写成
 * `if (group === "series") ...`），是为了让侧栏组件保持纯展示 ——
 * 它只负责渲染与回调，新增一个筛选维度不需要动组件。
 */

export type FilterOption = {
  value: string;
  label: string;
  /** 该选项命中哪些模型 */
  test: (model: Model) => boolean;
};

export type FilterGroupId =
  | "input-modalities"
  | "discounted"
  | "context-length"
  | "prompt-pricing"
  | "series"
  | "categories"
  | "supported-parameters"
  | "distillable"
  | "zero-data-retention";

export type FilterGroup = {
  id: FilterGroupId;
  label: string;
  /** 参考图里只有「Input modalities」是展开的，其余都折叠 */
  defaultOpen?: boolean;
  options: readonly FilterOption[];
};

/** 要求模型同时具备这些模态。 */
function hasAllModalities(...modalities: readonly Modality[]) {
  return (model: Model) =>
    modalities.every((m) => model.modalities.includes(m));
}

/**
 * 去重并排序。
 *
 * 用无参的 `.sort()`（按 UTF-16 码元）而不是 `.localeCompare()` —— 后者依赖运行环境的
 * locale，服务端与客户端可能给出不同顺序，那就是 hydration mismatch。
 */
function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

const SERIES_VALUES = uniqueSorted(MOCK_MODELS.map((model) => model.series));
const CATEGORY_VALUES = uniqueSorted(
  MOCK_MODELS.flatMap((model) => model.categories),
);
const PARAMETER_VALUES = uniqueSorted(
  MOCK_MODELS.flatMap((model) => model.supportedParameters),
);

export const FILTER_GROUPS: readonly FilterGroup[] = [
  {
    id: "input-modalities",
    label: "Input modalities",
    defaultOpen: true,
    options: [
      { value: "text", label: "Text", test: hasAllModalities("text") },
      { value: "image", label: "Image", test: hasAllModalities("image") },
      { value: "file", label: "File", test: hasAllModalities("file") },
      { value: "audio", label: "Audio", test: hasAllModalities("audio") },
      { value: "video", label: "Video", test: hasAllModalities("video") },
    ],
  },
  {
    id: "discounted",
    label: "Discounted",
    options: [
      {
        value: "discounted",
        label: "Discounted only",
        test: (model) => model.discounted,
      },
    ],
  },
  {
    id: "context-length",
    label: "Context length",
    options: [
      {
        value: "128k",
        label: "128K or more",
        test: (model) => model.contextLength >= 128_000,
      },
      {
        value: "1m",
        label: "1M or more",
        test: (model) => model.contextLength >= 1_000_000,
      },
    ],
  },
  {
    id: "prompt-pricing",
    label: "Prompt pricing",
    options: [
      {
        value: "under-1",
        label: "Under $1 / M",
        test: (model) => model.inputPricePerMillion < 1,
      },
      {
        value: "under-3",
        label: "Under $3 / M",
        test: (model) => model.inputPricePerMillion < 3,
      },
    ],
  },
  {
    id: "series",
    label: "Series",
    options: SERIES_VALUES.map((value) => ({
      value,
      label: value,
      test: (model: Model) => model.series === value,
    })),
  },
  {
    id: "categories",
    label: "Categories",
    options: CATEGORY_VALUES.map((value) => ({
      value,
      label: value,
      test: (model: Model) => model.categories.includes(value),
    })),
  },
  {
    id: "supported-parameters",
    label: "Supported parameters",
    options: PARAMETER_VALUES.map((value) => ({
      value,
      label: value,
      test: (model: Model) => model.supportedParameters.includes(value),
    })),
  },
  {
    id: "distillable",
    label: "Distillable",
    options: [
      {
        value: "distillable",
        label: "Distillable only",
        test: (model) => model.distillable,
      },
    ],
  },
  {
    id: "zero-data-retention",
    label: "Zero data retention",
    options: [
      {
        value: "zdr",
        label: "Zero data retention only",
        test: (model) => model.zeroDataRetention,
      },
    ],
  },
];

/**
 * 选中项的复合键。
 *
 * 把「分组 + 取值」拼成一个字符串，选中集合因此可以是一个扁平的 `Set<string>`，
 * 不需要嵌套的 Record —— 过滤时按分组聚合一次即可（见 features/models/index.tsx）。
 */
export function filterKey(groupId: FilterGroupId, value: string): string {
  return `${groupId}:${value}`;
}

/* ---------------------------------------------------------------------------
 * 工具栏
 * ------------------------------------------------------------------------- */

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "popular", label: "Most used" },
  { value: "cheapest", label: "Cheapest" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

/** 「All…」下拉的选项：只列出样例数据里真实出现过的 provider。 */
export const PROVIDER_FILTER_OPTIONS = uniqueSorted(
  MOCK_MODELS.map((model) => model.providerId),
).map((id) => ({ value: id, label: getProvider(id).label }));

export type ModalityTab = {
  value: Modality | "all";
  label: string;
  /**
   * 页签上的计数。
   *
   * 这些数字取自参考图，是**写死的展示值** —— 十几条样例数据算不出 454。
   * 接真实接口后应由接口返回，届时这里删掉即可（「All」本来就不显示计数）。
   */
  count?: number;
};

export const MODALITY_TABS: readonly ModalityTab[] = [
  { value: "all", label: "All" },
  { value: "text", label: "Text", count: 454 },
  { value: "image", label: "Image", count: 53 },
  { value: "video", label: "Video", count: 29 },
  { value: "speech", label: "Speech", count: 18 },
  { value: "transcription", label: "Transcription", count: 22 },
  { value: "embeddings", label: "Embeddings", count: 37 },
  { value: "rerank", label: "Rerank", count: 7 },
  { value: "decisions", label: "Decisions", count: 1 },
];
