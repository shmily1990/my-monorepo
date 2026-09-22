import { readFileSync } from "node:fs";
import path from "node:path";

/** 匹配 apps/<name>/ 或 packages/<name>/ 前缀（含结尾斜杠） */
const WORKSPACE_PREFIX = /^(?:apps|packages)\/[^/]+\//;

/** 交给 eslint + prettier 的代码文件 */
const CODE_FILES = "**/*.{ts,tsx,js,jsx,mjs,cjs}";

/** 只交给 prettier 的非代码文件 */
const NON_CODE_FILES = "**/*.{json,md,css,yml,yaml}";

/**
 * 该 workspace 是否纳入 lint 范围 —— 判据是它有没有 `lint` 脚本。
 *
 * 这不只是沿用仓库约定，更是必需的：packages/eslint-config 既没有 lint 脚本也没有
 * eslint.config.js。若按目录盲分发，一旦有人改动它下面的文件，eslint 会因为找不到
 * 配置而失败，进而阻塞所有人的提交。
 */
function hasLintScript(workspaceDir) {
  try {
    const pkg = JSON.parse(
      readFileSync(path.join(workspaceDir, "package.json"), "utf8"),
    );
    return Boolean(pkg.scripts?.lint);
  } catch {
    return false;
  }
}

/** 用 JSON.stringify 加引号，避免路径中的空格或特殊字符被 shell 拆开 */
function quote(file) {
  return JSON.stringify(file);
}

function prettierCommand(files) {
  return `prettier --write ${files.map(quote).join(" ")}`;
}

/**
 * 生成 eslint 命令，按 workspace 分组。
 *
 * 为什么不能直接在仓库根目录跑 eslint（两条都是实测结论，别简化掉）：
 *
 *  1. flat config 是从 **cwd 向上** 查找 eslint.config.*，而不是从被检查文件所在目录。
 *     根目录没有配置文件，会直接报：
 *       ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
 *
 *  2. 即使显式 --config 指向某个子包的配置，cwd 仍是根目录，结果依然是错的：
 *       - @next/next 的规则找不到 pages 目录；
 *       - typescript-eslint 的 projectService 会同时看到多个 workspace 的 tsconfig
 *         （告警 "Multiple projects found"），类型感知 lint 静默给出错误结果。
 *     不报错、只出错结果，比直接失败更危险。
 *
 * 所以必须用 `pnpm --dir <workspace>` 把 cwd 切到对应子包再执行；传给 eslint 的
 * 路径也要相应改成相对该子包的路径。
 */
function eslintCommands(filenames) {
  const groups = new Map();

  for (const raw of filenames) {
    // lint-staged 的 --relative 默认为 false，传进来的是绝对路径。这里统一归一化，
    // 同时兼容将来若改用 --relative 的情形。
    const file = path.relative(process.cwd(), raw);

    const prefix = file.match(WORKSPACE_PREFIX)?.[0];
    if (!prefix) continue; // 仓库根的文件：根目录没装 eslint，跳过

    const workspaceDir = prefix.slice(0, -1);
    if (!hasLintScript(workspaceDir)) continue;

    groups.set(workspaceDir, [
      ...(groups.get(workspaceDir) ?? []),
      file.slice(prefix.length),
    ]);
  }

  return [...groups].map(
    ([dir, files]) =>
      `pnpm --dir ${dir} exec eslint --fix ${files.map(quote).join(" ")}`,
  );
}

export default {
  // 代码文件：先 eslint --fix 再 prettier --write。
  // 必须放同一个数组返回，让 lint-staged 顺序执行；若拆成两个 glob，
  // 两个工具会并发写同一批文件。
  [CODE_FILES]: (files) => [...eslintCommands(files), prettierCommand(files)],

  // 非代码文件只做格式化。与上面的 glob 匹配集合不相交，所以并发也无冲突。
  [NON_CODE_FILES]: (files) => [prettierCommand(files)],
};
