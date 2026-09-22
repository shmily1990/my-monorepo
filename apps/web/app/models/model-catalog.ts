/**
 * 模型目录的演示数据。
 *
 * ⚠️ 这里的名称与价格是**为了搭页面而编的示意值**，不是 OpenRouter 或其他厂商的真实报价。
 * 接真实 API 时整份替换即可。
 *
 * 关于类型为什么放在这里而不是 @repo/x-typings：本仓库的规则是「两个以上包需要同一形状
 * 才放进 x-typings」。这份数据目前只有 apps/web 用，而且它是演示数据、不是 API 契约。
 * 将来真接接口时，`Model` 应该搬进 @repo/x-typings 作为 zod schema（schema 为唯一事实
 * 来源，类型由 z.infer 推导），届时这里只留数据或整份删掉。
 */

/** 模型能力标签，与 OpenRouter 列表里展示的那类标记对应 */
export type ModelTag =
  "Free" | "Tools" | "Vision" | "Reasoning" | "Long context";

export type Model = {
  /** 形如 `openai/gpt-4o`，与 OpenRouter 的 id 格式一致 */
  id: string;
  name: string;
  provider: string;
  /** 上下文窗口，单位 token */
  contextLength: number;
  /** 每百万输入 token 的美元价。0 表示免费 */
  promptPricePerM: number;
  /** 每百万输出 token 的美元价。0 表示免费 */
  completionPricePerM: number;
  tags: ModelTag[];
};

export const models: Model[] = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    contextLength: 128_000,
    promptPricePerM: 2.5,
    completionPricePerM: 10,
    tags: ["Vision", "Tools"],
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "OpenAI",
    contextLength: 128_000,
    promptPricePerM: 0.15,
    completionPricePerM: 0.6,
    tags: ["Vision", "Tools"],
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    contextLength: 200_000,
    promptPricePerM: 3,
    completionPricePerM: 15,
    tags: ["Vision", "Tools", "Reasoning"],
  },
  {
    id: "anthropic/claude-opus-4",
    name: "Claude Opus 4",
    provider: "Anthropic",
    contextLength: 200_000,
    promptPricePerM: 15,
    completionPricePerM: 75,
    tags: ["Vision", "Tools", "Reasoning"],
  },
  {
    id: "anthropic/claude-haiku-3.5",
    name: "Claude Haiku 3.5",
    provider: "Anthropic",
    contextLength: 200_000,
    promptPricePerM: 0.8,
    completionPricePerM: 4,
    tags: ["Vision", "Tools"],
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    contextLength: 1_048_576,
    promptPricePerM: 1.25,
    completionPricePerM: 10,
    tags: ["Vision", "Tools", "Long context"],
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    contextLength: 1_048_576,
    promptPricePerM: 0.3,
    completionPricePerM: 2.5,
    tags: ["Vision", "Tools", "Long context"],
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    provider: "Meta",
    contextLength: 131_072,
    promptPricePerM: 0.23,
    completionPricePerM: 0.4,
    tags: ["Tools"],
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B Instruct",
    provider: "Meta",
    contextLength: 131_072,
    promptPricePerM: 0.05,
    completionPricePerM: 0.08,
    tags: ["Tools"],
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    contextLength: 163_840,
    promptPricePerM: 0.27,
    completionPricePerM: 1.1,
    tags: ["Tools"],
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    contextLength: 163_840,
    promptPricePerM: 0.55,
    completionPricePerM: 2.19,
    tags: ["Reasoning"],
  },
  {
    id: "mistralai/mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    contextLength: 128_000,
    promptPricePerM: 2,
    completionPricePerM: 6,
    tags: ["Tools"],
  },
  {
    id: "qwen/qwen-2.5-72b-instruct",
    name: "Qwen2.5 72B Instruct",
    provider: "Qwen",
    contextLength: 131_072,
    promptPricePerM: 0.35,
    completionPricePerM: 0.4,
    tags: ["Tools"],
  },
  {
    id: "cohere/command-r-plus",
    name: "Command R+",
    provider: "Cohere",
    contextLength: 128_000,
    promptPricePerM: 2.5,
    completionPricePerM: 10,
    tags: ["Tools"],
  },
  {
    id: "x-ai/grok-3",
    name: "Grok 3",
    provider: "xAI",
    contextLength: 131_072,
    promptPricePerM: 3,
    completionPricePerM: 15,
    tags: ["Vision", "Tools", "Reasoning"],
  },
  {
    id: "amazon/nova-pro",
    name: "Nova Pro",
    provider: "Amazon",
    contextLength: 300_000,
    promptPricePerM: 0.8,
    completionPricePerM: 3.2,
    tags: ["Vision", "Tools"],
  },
  {
    id: "microsoft/phi-4",
    name: "Phi-4",
    provider: "Microsoft",
    contextLength: 16_384,
    promptPricePerM: 0.07,
    completionPricePerM: 0.14,
    tags: [],
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Llama 3.2 3B Instruct (free)",
    provider: "Meta",
    contextLength: 131_072,
    promptPricePerM: 0,
    completionPricePerM: 0,
    tags: ["Free"],
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B Instruct (free)",
    provider: "Mistral",
    contextLength: 32_768,
    promptPricePerM: 0,
    completionPricePerM: 0,
    tags: ["Free"],
  },
  {
    id: "google/gemma-2-9b-it:free",
    name: "Gemma 2 9B (free)",
    provider: "Google",
    contextLength: 8_192,
    promptPricePerM: 0,
    completionPricePerM: 0,
    tags: ["Free"],
  },
];
