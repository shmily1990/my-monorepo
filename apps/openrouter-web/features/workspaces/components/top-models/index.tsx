import { TOP_MODELS_EMPTY, TOP_MODELS_TITLES } from "../../data/usage";
import styles from "./index.module.scss";

/**
 * 用量图表右侧那两栏（Daily by model / Top models by spend）。
 *
 * 结构与参考图一致，内容是**诚实的空态** —— 新账号没有任何用量，所以两栏都只有标题
 * 加一句说明。不编造模型名与数字。
 */
export function TopModels() {
  return (
    <div className={styles.wrap}>
      {TOP_MODELS_TITLES.map((title) => (
        <section className={styles.column} key={title}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.empty}>{TOP_MODELS_EMPTY}</p>
        </section>
      ))}
    </div>
  );
}
