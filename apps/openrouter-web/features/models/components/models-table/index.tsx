import { ProviderMark } from "@/components/brand/provider-mark";
import { getProvider } from "@/lib/providers";
import { formatContext, formatPrice, formatTokens } from "@/lib/utils/format";

import type { Model } from "../../model";
import styles from "./index.module.scss";

/**
 * 表格视图。工具栏上 List | Table 的 Table 那一档。
 *
 * 手写 `<table>` 而不是用 @repo/ui 的 antd Table：这里只要一张静态只读表
 * （没有排序、没有分页、没有选择器、没有虚拟滚动），antd Table 会带进来一整套
 * 与之配套的样式与行为，然后为了贴合参考图再去覆盖它们。原生 table 语义完整、
 * 样式可控，代价只是几十行 JSX。
 *
 * 用 `<table>` 而不是 div 网格还顺带拿到了正确的读屏语义（表头与单元格的关联）。
 */
export function ModelsTable({ models }: { models: readonly Model[] }) {
  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Model</th>
            <th scope="col">Provider</th>
            <th scope="col" className={styles.numeric}>
              Context
            </th>
            <th scope="col" className={styles.numeric}>
              Input $/M
            </th>
            <th scope="col" className={styles.numeric}>
              Output $/M
            </th>
            <th scope="col" className={styles.numeric}>
              Tokens
            </th>
          </tr>
        </thead>

        <tbody>
          {models.map((model) => (
            <tr key={model.id}>
              <td>
                <span className={styles.nameCell}>
                  <ProviderMark providerId={model.providerId} size={20} />
                  {model.name}
                </span>
              </td>
              <td>{getProvider(model.providerId).label}</td>
              <td className={styles.numeric}>
                {formatContext(model.contextLength)}
              </td>
              <td className={styles.numeric}>
                {formatPrice(model.inputPricePerMillion)}
              </td>
              <td className={styles.numeric}>
                {formatPrice(model.outputPricePerMillion)}
              </td>
              <td className={styles.numeric}>
                {formatTokens(model.monthlyTokens)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
