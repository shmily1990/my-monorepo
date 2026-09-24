"use client";

import { Button } from "@repo/ui";

import { useAuthDialog } from "@/features/auth";
import type { AuthUser } from "@/lib/auth/types";

import { UserMenu } from "./user-menu";
import styles from "./header-auth.module.scss";

/**
 * header 右侧的认证区。
 *
 * 这是 header 里除搜索框之外的第二个客户端组件 —— 它要能打开弹框（`useAuthDialog`），
 * 而弹框的开关状态挂在根 layout 的 provider 上（这样首页 hero 与收尾 CTA 也能打开它）。
 *
 * 两种形态：
 *   - 未登录：Sign Up 药丸按钮，点击开弹框。用 antd `Button` 而不是 `<Link>` ——
 *     它不跳转，只改本地状态，所以语义上是按钮。
 *   - 已登录：头像 + 用户菜单，见 `./user-menu.tsx`。
 *
 * `shape="round"` 是参考图那个药丸形状（antd 自带 prop，不必写 border-radius 去覆盖）。
 */
export function HeaderAuth({ user }: { user: AuthUser | null }) {
  const { openAuth } = useAuthDialog();

  if (!user) {
    return (
      <Button
        className={styles.signUp}
        type="primary"
        shape="round"
        size="large"
        onClick={() => openAuth("signup")}
      >
        Sign Up
      </Button>
    );
  }

  return <UserMenu user={user} />;
}
