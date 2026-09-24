"use client";

import { Button } from "@repo/ui";

import { oauthAction } from "../../actions";
import styles from "./index.module.scss";

/**
 * 三个 OAuth 按钮。
 *
 * **纯文字，不画品牌图形**：按项目决策不引入任何品牌素材（同 provider 占位块那套理由 ——
 * 仓库没有 public/、不联网取素材、不涉商标）。文字也更可访问：屏幕阅读器读得出
 * "Continue with GitHub"，一个近似的图形读不出。
 *
 * 每个按钮是**独立的 `<form>`**，provider 走隐藏字段。这样做的好处是不用
 * `useActionState`、不需要任何客户端状态，而且禁用了 JS 也能提交。
 */
const PROVIDERS = [
  { id: "github", label: "GitHub" },
  { id: "google", label: "Google" },
  { id: "gitlab", label: "GitLab" },
] as const;

export function OAuthButtons() {
  return (
    <div className={styles.providers}>
      {PROVIDERS.map((provider) => (
        <form key={provider.id} className={styles.form} action={oauthAction}>
          <input type="hidden" name="provider" value={provider.id} />
          <Button
            className={styles.button}
            size="large"
            block
            htmlType="submit"
          >
            Continue with {provider.label}
          </Button>
        </form>
      ))}
    </div>
  );
}
