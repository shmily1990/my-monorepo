/**
 * provider 注册表。
 *
 * 只存展示用的标签，**不含品牌色、不含品牌 logo** —— 按项目决策，provider 位置统一用
 * 中性几何占位块，完全不做品牌区分（见 components/brand/provider-mark.tsx）。
 * 因此这里也不需要维护任何商标素材。
 */

export const PROVIDER_IDS = [
  "openai",
  "anthropic",
  "google",
  "meta",
  "mistral",
  "cohere",
  "xai",
  "deepseek",
  "qwen",
  "perplexity",
  "amazon",
  "nvidia",
  "groq",
] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

export type Provider = {
  id: string;
  label: string;
};

const PROVIDER_LABELS: Record<ProviderId, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  meta: "Meta",
  mistral: "Mistral",
  cohere: "Cohere",
  xai: "xAI",
  deepseek: "DeepSeek",
  qwen: "Qwen",
  perplexity: "Perplexity",
  amazon: "Amazon",
  nvidia: "NVIDIA",
  groq: "Groq",
};

/**
 * 取 provider 元数据。未知 id 原样作为标签返回，不会返回 undefined。
 *
 * 这里的兜底是刻意的：base.json 开了 `noUncheckedIndexedAccess`，直接写
 * `PROVIDER_LABELS[id]` 会得到 `string | undefined`，于是每个调用点都得自己判空。
 * 在这一个地方收敛掉，调用方就不用各自处理未知 provider。
 */
export function getProvider(id: string): Provider {
  const label = PROVIDER_LABELS[id as ProviderId];
  return { id, label: label ?? id };
}

export function isProviderId(value: string): value is ProviderId {
  return (PROVIDER_IDS as readonly string[]).includes(value);
}
