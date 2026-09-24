"use client";

import { Input } from "@repo/ui";
import { useState } from "react";

import { EyeIcon, EyeOffIcon } from "@/components/icons";

import styles from "./index.module.scss";

/**
 * 密码输入框 + 可见性切换。
 *
 * **不能用 antd 的 `Input.Password`**：它是挂在 `Input` 上的**静态属性**，而静态属性在
 * 服务端组件拿到的 client reference 上是 `undefined`，构建期就会报
 * "Element type is invalid ... got: undefined"。这是根 AGENTS.md 明确记录过的坑。
 * 替代方案是切换 `type`：`type` 是普通 DOM 属性，不需要受控值也能改。
 *
 * `revealed` 留在本组件内部，是**有意的例外** —— "密码显示与否" 属于这一个控件的内部表现，
 * 把它提到表单编排层等于把密码相关的关注点泄漏上去。它与 `features/models` 那个
 * "单一客户端状态边界" 的约定不冲突：那条约定针对的是需要跨组件共享的业务状态。
 */
export function PasswordField({
  id,
  name,
  label,
  placeholder,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <Input
        id={id}
        name={name}
        className={styles.input}
        size="large"
        type={revealed ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        suffix={
          /*
           * `type="button"` 是必需的 —— 缺了它这个按钮会提交表单。
           * suffix 本来就是一个交互槽位（antd 自己的 allowClear 就放在这里）。
           */
          <button
            type="button"
            className={styles.eye}
            onClick={() => setRevealed((previous) => !previous)}
            aria-label={revealed ? "隐藏密码" : "显示密码"}
            aria-pressed={revealed}
          >
            {revealed ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        }
      />
    </div>
  );
}
