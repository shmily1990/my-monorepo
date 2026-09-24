"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import {
  AudioModalityIcon,
  ChevronDownIcon,
  DecisionsModalityIcon,
  EmbeddingsModalityIcon,
  FileModalityIcon,
  ImageModalityIcon,
  RerankModalityIcon,
  SpeechModalityIcon,
  TextModalityIcon,
  TranscriptionModalityIcon,
  VideoModalityIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils/cn";

import { MODALITY_TABS } from "../../data/filters";
import type { Modality } from "../../model";
import styles from "./index.module.scss";

/**
 * 模态 → 页签图标。
 *
 * 用完整的 Record 而不是 Partial：将来往 Modality 里加成员时，这里会直接编译报错
 * 提醒补图标，而不是在界面上静默留空。渲染时「All」会先被排除掉，取不到 undefined。
 */
const TAB_ICONS: Record<Modality, ReactNode> = {
  text: <TextModalityIcon size={16} />,
  image: <ImageModalityIcon size={16} />,
  file: <FileModalityIcon size={16} />,
  audio: <AudioModalityIcon size={16} />,
  video: <VideoModalityIcon size={16} />,
  speech: <SpeechModalityIcon size={16} />,
  transcription: <TranscriptionModalityIcon size={16} />,
  embeddings: <EmbeddingsModalityIcon size={16} />,
  rerank: <RerankModalityIcon size={16} />,
  decisions: <DecisionsModalityIcon size={16} />,
};

/**
 * 模态页签条。
 *
 * 「More」不是一个模态，参考图里它是溢出入口。这里给它一个真实行为：
 * 在单行滚动与换行铺开之间切换 —— 窄屏下页签要横向滚动才能看全，
 * 点 More 就全部铺开。比放一个点了没反应的按钮诚实。
 */
export function ModalityTabs({
  active,
  onChange,
}: {
  active: Modality | "all";
  onChange: (value: Modality | "all") => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(styles.strip, expanded && styles.expanded)}
      role="tablist"
      aria-label="按模态筛选"
    >
      {MODALITY_TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === active}
          className={cn(styles.tab, tab.value === active && styles.active)}
          onClick={() => onChange(tab.value)}
        >
          {/* 「All」不是模态，没有图标；这一步同时把类型收窄到 Modality，才能索引 TAB_ICONS */}
          {tab.value === "all" ? null : TAB_ICONS[tab.value]}
          <span>{tab.label}</span>
          {tab.count === undefined ? null : (
            <span className={styles.count}>{tab.count}</span>
          )}
        </button>
      ))}

      <button
        type="button"
        className={cn(styles.tab, styles.more)}
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        More
        <ChevronDownIcon size={15} className={styles.chevron} />
      </button>
    </div>
  );
}
