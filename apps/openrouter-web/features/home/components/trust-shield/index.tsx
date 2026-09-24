import {
  CheckCircleIcon,
  PadlockIcon,
  PeopleIcon,
  ShieldIcon,
} from "@/components/icons";

import styles from "./index.module.scss";

/**
 * 特性卡四：盾牌 + 一组人 + 绿色对勾，两侧各一把锁。
 *
 * 四个图标来自共用的 components/icons，这里只负责摆放与配色 ——
 * 盾牌用浅色描边，对勾用 --or-success 上色，锁用次级灰。
 */
export function TrustShield() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <PadlockIcon size={20} className={styles.lock} />

      <div className={styles.shield}>
        <ShieldIcon size={104} className={styles.outline} />
        <PeopleIcon size={38} className={styles.people} />
        <CheckCircleIcon size={26} className={styles.check} />
      </div>

      <PadlockIcon size={20} className={styles.lock} />
    </div>
  );
}
