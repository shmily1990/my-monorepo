import { Avatar } from "@repo/ui";

import { CameraIcon, UserIcon } from "@/components/icons";
import type { AuthUser } from "@/lib/auth/types";

import styles from "./index.module.scss";

/**
 * 身份块：头像 + 姓名 + 邮箱，对应 docs/workspace.jpg 顶部那一行。
 *
 * 数据来自会话（服务端读出的 `user`），不是写死的 —— 注册成什么名字，这里就显示什么。
 *
 * 头像用 `@repo/ui` 的 `Avatar` + 项目自己的 `UserIcon`：**不能用 `@ant-design/icons`**
 * （它只是 antd 的传递依赖，应用没声明它，`import/no-extraneous-dependencies` 会拦下）。
 */
export function WorkspaceIdentity({ user }: { user: AuthUser }) {
  return (
    <div className={styles.identity}>
      <div className={styles.avatarWrap}>
        <Avatar
          className={styles.avatar}
          size={56}
          icon={<UserIcon size={26} />}
        />

        {/* 纯装饰：参考图里头像右下角压着一个相机徽标，暗示"可以换头像" */}
        <span className={styles.camera} aria-hidden="true">
          <CameraIcon size={13} />
        </span>
      </div>

      <div className={styles.text}>
        <h1 className={styles.name}>{user.name}</h1>
        <p className={styles.email}>{user.email}</p>
      </div>
    </div>
  );
}
