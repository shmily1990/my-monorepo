"use client";

import { Button, Checkbox } from "@repo/ui";
import Link from "next/link";
import { useActionState, useState } from "react";

import { signUpAction } from "../../actions";
import type { AuthFormState } from "../../data/form";
import { PasswordField } from "../password-field";
import { TextField } from "../text-field";
import styles from "./index.module.scss";

const INITIAL_STATE: AuthFormState = {};

/**
 * 注册表单，逐项对应 docs/signin.jpg：姓名两栏（都标 Optional）、邮箱、密码（带眼睛）、
 * 条款勾选（三个内嵌链接）、全宽 Continue。
 *
 * 字段值由本组件持有（受控），所以提交失败时用户填的内容不会丢。
 * 校验在服务端的 `signUpAction` 里，这里只负责把 FormData 交出去。
 */
export function SignUpForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    INITIAL_STATE,
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <form className={styles.form} action={formAction}>
      <div className={styles.nameRow}>
        <TextField
          id="signup-first-name"
          name="firstName"
          label="First name"
          hint="Optional"
          autoComplete="given-name"
          value={firstName}
          onChange={setFirstName}
        />
        <TextField
          id="signup-last-name"
          name="lastName"
          label="Last name"
          hint="Optional"
          autoComplete="family-name"
          value={lastName}
          onChange={setLastName}
        />
      </div>

      <TextField
        id="signup-email"
        name="email"
        label="Email address"
        placeholder="Enter your email address"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={setEmail}
      />

      <PasswordField
        id="signup-password"
        name="password"
        label="Password"
        placeholder="Create a password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
      />

      {/*
        勾选框与文字标签**分开写**，而不是把文字塞进 Checkbox 的 children：
        antd 会把 children 包进一个 <label>，而链接落在 label 里时点击是"导航还是勾选"
        就变成了含糊行为。按 HTML 规范，<label> 的激活行为在点击目标是交互内容时会被跳过，
        所以这里显式用 htmlFor 关联，三个链接就能稳定导航。
      */}
      <div className={styles.termsRow}>
        <Checkbox
          id="signup-terms"
          name="terms"
          value="agreed"
          checked={termsAccepted}
          onChange={(event) => setTermsAccepted(event.target.checked)}
        />
        <label className={styles.termsLabel} htmlFor="signup-terms">
          I agree to the{" "}
          <Link className={styles.termsLink} href="/terms">
            Terms of Service
          </Link>
          ,{" "}
          <Link className={styles.termsLink} href="/privacy">
            Privacy Policy
          </Link>
          , and{" "}
          <Link className={styles.termsLink} href="/model-terms">
            Model Terms
          </Link>
          .
        </label>
      </div>

      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <Button
        type="primary"
        size="large"
        block
        htmlType="submit"
        loading={pending}
      >
        Continue
      </Button>
    </form>
  );
}
