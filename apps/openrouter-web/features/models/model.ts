import type { ProviderId } from "@/lib/providers";

/*
 * 模型目录的类型。
 *
 * **刻意留在应用内，不进 @repo/x-typings** —— 按 add-shared-type 那份 skill 的判据：
 *   - 只有一个包需要它（应用是唯一消费方）；
 *   - 它是纯类型，没有任何运行时校验，也没有第二个消费方；
 *   - 一旦写成 Zod schema 就要把 zod 拉进应用，而这里根本没有需要 parse 的数据。
 * 那种"投机性类型"正是 skill 里说会稀释该包价值的东西。
 *
 * 升级触发点：当某个 route handler / API client 开始 parse 这个形状，或者第二个包需要
 * 引用它时，就提升为 packages/x-typings/src/model.ts（Zod schema + z.infer），
 * 调用点除了 import 路径之外不用改。
 */

/**
 * 模态。
 *
 * 一个联合类型同时覆盖两处不同的分类法：
 *   - 侧栏「Input modalities」用其中的 text / image / file / audio / video；
 *   - 主列模态页签用其中的 text / image / video / speech / transcription / embeddings /
 *     rerank / decisions。
 * 参考图里这两处本就是两套维度（输入能力 vs 模型输出能力），这里合并成一个联合类型，
 * 避免为了形式上的一致而拆出两个几乎相同的 type。
 */
export type Modality =
  | "text"
  | "image"
  | "file"
  | "audio"
  | "video"
  | "speech"
  | "transcription"
  | "embeddings"
  | "rerank"
  | "decisions";

/** 模型名后面跟的小标记。 */
export type ModelBadge = "vision" | "batch";

export type Model = {
  /** provider/slug 形式，同时用作 React key */
  id: string;
  /** 展示名，如 "Cohere: Command A+" */
  name: string;
  providerId: ProviderId;
  description: string;
  /** ISO 日期 "2026-09-22"，渲染时格式化 */
  releasedAt: string;
  contextLength: number;
  /** 每百万 input token 的单价（美元） */
  inputPricePerMillion: number;
  /** 每百万 output token 的单价（美元） */
  outputPricePerMillion: number;
  /** 月 token 用量，用于「8.25M tokens」与热门排序 */
  monthlyTokens: number;
  modalities: readonly Modality[];
  badges: readonly ModelBadge[];
  pinned: boolean;
  /** 所属系列，如 "Command"、"GPT" */
  series: string;
  categories: readonly string[];
  supportedParameters: readonly string[];
  distillable: boolean;
  zeroDataRetention: boolean;
  discounted: boolean;
};
