/**
 * 模型列表元信息行的格式化。
 *
 * 全部手写、不依赖 `Intl` / `toLocaleDateString` —— 这些 API 的结果取决于运行环境的
 * locale 与时区，而同一个组件既在服务端渲染一次、又在客户端渲染一次，两边结果不一致
 * 就是 hydration mismatch。手写映射表则与运行环境无关，两端必然一致。
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "2026-09-22" → "Sep 22, 2026"。解析失败时原样返回，不抛错。 */
export function formatDate(iso: string): string {
  const parts = iso.split("-");
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (!year || !month || !day) return iso;

  const monthLabel = MONTHS[Number(month) - 1];
  if (!monthLabel) return iso;

  return `${monthLabel} ${Number(day)}, ${year}`;
}

/**
 * token 量 → 缩写形式。
 * 8_250_000 → "8.25M"；24_700_000_000 → "24.7B"；539_000_000 → "539M"
 *
 * 保留有效位数而不是固定小数位，是为了贴合参考图里的写法（8.25M 与 539M 并存）。
 */
export function formatTokens(count: number): string {
  const units = [
    { threshold: 1e12, suffix: "T" },
    { threshold: 1e9, suffix: "B" },
    { threshold: 1e6, suffix: "M" },
    { threshold: 1e3, suffix: "K" },
  ] as const;

  for (const { threshold, suffix } of units) {
    if (count >= threshold) {
      const value = count / threshold;
      // 整数就不带小数点，否则最多留两位有效小数
      const rounded =
        value >= 100 ? Math.round(value) : Number(value.toFixed(2));
      return `${rounded}${suffix}`;
    }
  }

  return String(count);
}

/**
 * 上下文长度 → 缩写形式。
 * 192_000 → "192K"；1_050_000 → "1.05M"
 *
 * 与 formatTokens 分开写：这里的 1_000_000 要显示成 "1.05M" 而 token 量那边是 "24.7B"
 * 这类整数量级，两者的取整策略不同（上下文长度保留两位小数以体现 1.05M 与 1M 的差别）。
 */
export function formatContext(tokens: number): string {
  if (tokens >= 1e6) {
    const value = tokens / 1e6;
    return `${Number(value.toFixed(2))}M`;
  }
  if (tokens >= 1e3) {
    return `${Math.round(tokens / 1e3)}K`;
  }
  return String(tokens);
}

/** 每百万 token 的单价 → "$0.30"。参考图统一两位小数。 */
export function formatPrice(pricePerMillion: number): string {
  return `$${pricePerMillion.toFixed(2)}`;
}

/**
 * ISO 日期 → "9/22"（月/日，都不补零）。给用量图表的横轴用。
 *
 * 与 formatDate 分开而不是加个参数：那个给元信息行用完整月份名（"Sep 22, 2026"），
 * 这个给密集排列的横轴标签用短格式，两者没有共同的调用场景。
 * 同样不碰 Date / toLocaleDateString，理由见文件头。
 */
export function formatMonthDay(iso: string): string {
  const parts = iso.split("-");
  const month = parts[1];
  const day = parts[2];

  if (!month || !day) return iso;
  return `${Number(month)}/${Number(day)}`;
}

/**
 * 用量金额 → "$0.000"（三位小数）。
 *
 * 与 formatPrice 分开是因为精度不同：单价在参考图里是两位（$0.30），
 * API key 的用量列是三位（$0.000）。同一个事实两处精度不一样，就不该共用一个函数。
 */
export function formatCreditUsage(amount: number): string {
  return `$${amount.toFixed(3)}`;
}

/**
 * 本地日期时间 → "Mar 22, 2027, 3:54 PM"。输入形如 "2027-03-22T15:54"。
 *
 * **刻意不输出时区。** 参考图末尾那个 "GMT+8" 是浏览者本地时区，如果照抄，
 * 服务端与客户端就会给出不同结果 —— 那正是 hydration mismatch。
 * 同理不碰 `Date` 与 `toLocaleString`：这里全部是手写解析与 12 小时制换算。
 * 不带时区的一串数字在语义上就是"本地墙上时间"，与它要表达的意思一致。
 */
export function formatDateTime(iso: string): string {
  const [datePart, timePart] = iso.split("T");
  if (!datePart || !timePart) return iso;

  const [hourPart, minutePart] = timePart.split(":");
  if (!hourPart || !minutePart) return iso;

  const hour24 = Number(hourPart);
  const suffix = hour24 < 12 ? "AM" : "PM";
  // 0 点与 12 点都显示 12，这是 12 小时制的约定
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${formatDate(datePart)}, ${hour12}:${minutePart} ${suffix}`;
}
