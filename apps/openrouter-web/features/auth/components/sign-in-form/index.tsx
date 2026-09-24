"use client";

import { Button } from "@repo/ui";
import { useActionState, useState } from "react";

import { signInAction } from "../../actions";
import type { AuthFormState } from "../../data/form";
import { PasswordField } from "../password-field";
import { TextField } from "../text-field";
import styles from "./index.module.scss";

const INITIAL_STATE: AuthFormState = {};

/**
 * 登录表单。
 *
 * **原型里没有这一面** —— `docs/signin.jpg` 只画了注册。字段是按对称性推的：
 * 去掉姓名两栏与条款勾选，其余（OAuth、or 分隔线、邮箱、密码、Continue）与注册一致。
 *
 * 末尾那行测试账号是**字面量，刻意不从 `lib/auth/mock-users.ts` import** ——
 * 那个模块含明文密码，一旦被客户端组件引用，整张表连同密码都会被打进 client bundle。
 * 改账号时两处都要改，真源在那个文件。
 */
export function SignInForm() {
  const [state, formAction, pending] = useActionState(
    signInAction,
    INITIAL_STATE,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form className={styles.form} action={formAction}>
      <TextField
        id="signin-email"
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
        id="signin-password"
        name="password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />

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

      <p className={styles.hint}>测试账号：demo@openrouter.ai / demo1234</p>
    </form>
  );
}
