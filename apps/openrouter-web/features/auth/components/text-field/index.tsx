"use client";

import { Input } from "@repo/ui";

import styles from "./index.module.scss";

/**
 * 带标签的文本输入框。
 *
 * 标签行右侧可以挂一句提示 —— 参考图里 First name / Last name 右边的 "Optional"。
 *
 * 受控值由调用方（两个表单）持有，所以提交失败时用户填的内容不会丢。
 * 这里**不做任何校验**：校验在服务端的 Server Action 里，那是安全边界；
 * 客户端校验只是体验优化，本次连那层也省了（参考图里没有即时校验的表现）。
 */
export function TextField({
  id,
  name,
  label,
  hint,
  placeholder,
  type = "text",
  autoComplete,
  required,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  placeholder?: string;
  type?: "text" | "email";
  autoComplete?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>

      <Input
        id={id}
        name={name}
        className={styles.input}
        size="large"
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
