@AGENTS.md

<!--
本文件只是指针，不要在这里写规则 —— 请改 AGENTS.md。

为什么需要这个文件：Claude Code 的记忆文件加载是硬编码的，只认 CLAUDE.md /
CLAUDE.local.md（本机 2.1.239 二进制已确认：加载路径里没有任何 AGENTS.md 分支）。
而 AGENTS.md 才是跨工具约定，Codex / Cursor / Copilot 等都直接读它。上面那一行
import 让 Claude Code 也读到同一份内容，规范源因此只有一处。

首次加载时 Claude Code 会弹一次「是否允许导入」的确认。**如果拒绝，这个 import 会
被静默禁用，Claude Code 就读不到任何项目规则了。** 遇到这种情况请重新允许；确认
方法是问一句「AGENTS.md 里的 Per-workspace rules 讲了什么」，答不上来就是没加载。

同理，skills 的真身在 .agents/skills/，.claude/skills 是指向它的符号链接。
-->
