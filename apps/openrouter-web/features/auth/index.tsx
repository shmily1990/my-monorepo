"use client";

import { Divider, Modal } from "@repo/ui";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { OAuthButtons } from "./components/oauth-buttons";
import { SignInForm } from "./components/sign-in-form";
import { SignUpForm } from "./components/sign-up-form";
import type { AuthMode } from "./data/form";
import styles from "./index.module.scss";

/*
 * 认证弹框 + 它的开关状态。
 *
 * 两件事放同一个文件是因为它们本来就绑在一起：provider 持有 mode 与 open，
 * 弹框只是它们的一个纯展示视图 —— 拆成两个文件反而要来回 import。
 *
 * 开关状态挂在根 layout 的 provider 上，而不是塞进 header 内部：首页 hero 与收尾 CTA 的
 * 「Get API Key」也要能打开它，而那两处离 header 很远。
 *
 * 这个文件的 `"use client"` 覆盖全部子组件（它们在同一个客户端图里），
 * 所以下面的表单、字段、OAuth 按钮都不必各自再写一遍指令。
 */

/* ---------------------------------------------------------------------------
 * 开关状态
 * ------------------------------------------------------------------------- */

type AuthDialogContextValue = {
  /** 打开弹框。默认注册；传 "signin" 则直接开在登录面。 */
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  /*
   * mode 与 open 放在同一个 state 对象里：它们总是一起被读，分开写只会多一次渲染，
   * 而且「打开时用什么模式」这件事本身就是单个事实。
   */
  const [dialog, setDialog] = useState<{ open: boolean; mode: AuthMode }>({
    open: false,
    mode: "signup",
  });

  const openAuth = useCallback((mode: AuthMode = "signup") => {
    setDialog({ open: true, mode });
  }, []);

  const closeAuth = useCallback(() => {
    setDialog((previous) => ({ ...previous, open: false }));
  }, []);

  const changeMode = useCallback((mode: AuthMode) => {
    setDialog((previous) => ({ ...previous, mode }));
  }, []);

  const value = useMemo(() => ({ openAuth, closeAuth }), [openAuth, closeAuth]);

  return (
    <AuthDialogContext.Provider value={value}>
      {children}

      <AuthDialog
        open={dialog.open}
        mode={dialog.mode}
        onModeChange={changeMode}
        onClose={closeAuth}
      />
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog(): AuthDialogContextValue {
  const value = useContext(AuthDialogContext);

  if (!value) {
    throw new Error(
      "useAuthDialog 必须在 <AuthDialogProvider> 内使用 —— 它挂在 app/layout.tsx 的 UiProvider 里。",
    );
  }

  return value;
}

/* ---------------------------------------------------------------------------
 * 弹框本体
 * ------------------------------------------------------------------------- */

/**
 * 登录 / 注册弹框。对应 docs/signin.jpg。
 *
 * 外壳用 antd 的 `Modal`，内容全部手写。用 Modal 是为了白拿遮罩、焦点陷阱、Esc 关闭、
 * 滚动锁定 —— 这几样手写都容易做错；它自带的右上角关闭按钮也正合参考图（已核实 antd 6
 * 用 `insetInlineEnd` 定位，LTR 下就是右侧）。
 *
 * 模式由 provider 持有，本组件不存状态 —— 单一事实来源，也就没有"关掉再打开时模式没重置"
 * 之类的问题。切换模式时两个表单是**不同组件**，React 会卸载旧的、挂载新的，因此表单值与
 * 上一次的错误都会自然清空。
 *
 * 表单是手写的，**没有用 antd 的 `Form`** —— 它不在 `@repo/ui` 的 barrel 里，而需要的布局
 * （姓名两栏、条款勾选内嵌三个链接）自己写比套一层 Form 再去覆盖它更直接。
 * 因此 `packages/ui` 本次一行未改。
 */
export function AuthDialog({
  open,
  mode,
  onModeChange,
  onClose,
}: {
  open: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
}) {
  const isSignUp = mode === "signup";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={isSignUp ? "Sign Up" : "Sign In"}
      footer={null}
      centered
      width={440}
      /* 关掉即卸载内容，所以每次打开都是干净的表单 */
      destroyOnHidden
      /*
       * classNames 走 CSS Module（排版、居中这类"好看"的事，用令牌写）；
       * styles 走内联（把 body 默认的 24px 内边距清零这件"必须生效"的事 ——
       * 页脚那条分隔线要通栏就靠它）。
       * 两者都优于写 :global(.ant-modal-*) 去猜 antd 的内部类名。
       */
      classNames={{
        header: styles.header,
        title: styles.title,
        body: styles.body,
      }}
      styles={{ body: { padding: 0 } }}
    >
      <div className={styles.content}>
        {/* OAuth 的每个按钮各自是一个 <form>，必须放在下面那个表单**之外**（form 不能嵌套） */}
        <OAuthButtons />

        <Divider className={styles.or}>or</Divider>

        {isSignUp ? <SignUpForm /> : <SignInForm />}
      </div>

      <div className={styles.footer}>
        <span>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
        </span>{" "}
        {/* 这是模式切换，不改变路由，所以用 button 而不是 Link */}
        <button
          type="button"
          className={styles.footerAction}
          onClick={() => onModeChange(isSignUp ? "signin" : "signup")}
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </div>
    </Modal>
  );
}
