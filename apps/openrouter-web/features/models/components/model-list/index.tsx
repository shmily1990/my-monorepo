import type { Model } from "../../model";
import { ModelCard } from "../model-card";
import styles from "./index.module.scss";

/**
 * 卡片视图：按当前筛选结果竖排模型卡片。
 *
 * 「筛选结果为空」由父组件统一处理一次（列表与表格两种视图共用），
 * 所以这里假定 models 非空。
 */
export function ModelList({ models }: { models: readonly Model[] }) {
  return (
    <div className={styles.list}>
      {models.map((model) => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  );
}
