# Prompt 視覺化素材工作台

本專案是 local-first 的 Prompt 素材管理與組合工作台。P0 foundation 使用 Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui、Drizzle ORM、SQLite、Zod 與 Zustand。

## 本機啟動

```bash
npm install
npm run dev
```

預設開啟：

```text
http://localhost:3000
```

## 本機資料

- SQLite database: `data/app.db`
- 圖片目錄: `data/uploads/`

`data/app.db`、SQLite WAL/SHM/journal、`.env.local` 與上傳圖片檔已由 `.gitignore` 忽略。`data/uploads/.gitkeep` 用於保留目錄。

## 驗證

```bash
npm run lint
npm run build
npm test
rg -n "tp-sh|XIAOMI_MIMO_API_KEY=.*[A-Za-z0-9]{12,}" .
```
