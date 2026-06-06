# Prompt 視覺化素材工作台

自用、local-first 的 Prompt 素材管理與組合工作台。它用來建立、分類、搜尋、看圖選擇、編譯與保存圖片 Prompt；產品本身不生成圖片，也不接入任何圖片生成模型。

## 安裝與啟動

```bash
npm install
npm run dev
```

預設本機網址：

```text
http://localhost:3000
```

Next.js 16 dev server 已允許 `127.0.0.1` 作為本機開發來源；若遇到 hydration 或 dev resource 問題，優先使用 `http://localhost:3000`。

## 驗證

```bash
npm run lint
npm run build
npm test
```

Secret scan:

```bash
rg -n "tp-sh|XIAOMI_MIMO_API_KEY=.*[A-Za-z0-9]{12,}|sk-[A-Za-z0-9]" .
```

## 環境變數

複製 `.env.example` 到 `.env.local`，只在本機填入真值。

```bash
XIAOMI_MIMO_API_KEY=
XIAOMI_MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1
XIAOMI_MIMO_MODEL=mimo-v2.5-pro
```

`XIAOMI_MIMO_API_KEY` 只由 server route 使用，前端不應也不需要讀取真 key。

## 本機資料

- SQLite database: `data/app.db`
- 使用者上傳圖片: `data/uploads/`
- 內建 seed 圖片: `data/uploads/seed/`

`data/app.db`、SQLite WAL/SHM/journal、`.env.local` 與非 seed 上傳圖片都由 `.gitignore` 忽略。備份時請同時備份 `data/app.db` 和 `data/uploads/`。

Seed 圖片是開發期生成的預覽素材，只用於內建 starter library；app runtime 不提供圖片生成功能。
