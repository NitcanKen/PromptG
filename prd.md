# Prompt 視覺化素材工作台 PRD

本 PRD 由 `prompt_atom_workbench_spec.md` 整理而來。開發時以本 PRD 作為產品決策與技術決策來源；當需要查詢更細的互動文案、完整流程、分類含義或邊界條件時，必須回看 `prompt_atom_workbench_spec.md`。

## 1. 產品定位

Prompt 視覺化素材工作台是一個私人、自用、local-first 的 Prompt 素材管理與組合工具。

它不生成圖片，也不接入任何 AI 圖像生成模型。它只負責管理、拆解、選擇、重組和沉澱圖片 Prompt。

核心價值：

1. 把長圖片 Prompt 拆成可管理、可搜索、可預覽、可重組的 Prompt 素材。
2. 讓使用者用看圖選擇的方式組合 Prompt，而不是每次從零書寫。
3. 把好用的完整 Prompt 保存到私人 Gallery。
4. 把 Gallery 或外部完整 Prompt 再拆解成可重用素材。

## 2. 目標使用者

目標使用者是單一個人使用者，主要用途是管理自己的圖片 Prompt 靈感與成品。

產品不面向公眾平台，不需要多用戶、社交、付費、公開素材庫、公開 Gallery、作者主頁或內容運營功能。

## 2.1 語言要求

開發文檔、程式內部命名、註解與技術計劃可以使用英文或中英混合，但產品實際呈現給使用者的所有內容必須使用繁體中文。

繁體中文範圍包括：

1. 頁面標題、區塊標題、按鈕、選單、標籤、表單 label。
2. Dialog、Sheet、Popover、Tooltip、Toast、Alert、Empty state、Loading state。
3. 錯誤訊息、驗證訊息、刪除確認文案。
4. Gallery 與素材管理 UI 文案。
5. Prompt 拆解流程中的所有使用者可見文案。
6. 內建示例素材的標題、副標題、標籤與備註。

Prompt 正文可以保留英文，因為圖片 Prompt 片段本身通常以英文撰寫。

## 3. MVP 目標

第一版必須完成一個可日常使用的閉環：

1. 建立、編輯、刪除 Prompt 素材。
2. 每個素材可保存分類、標題、副標題、預覽圖、Prompt 正文、Negative Prompt、標籤和備註。
3. 按 16 個固定分類看圖選擇素材。
4. 支持單選分類與多選分類。
5. 自動把當前組合編譯成完整 Prompt。
6. 支持自動模式與自定義模式。
7. 支持複製 Prompt。
8. 支持保存完整 Prompt 到私人 Gallery。
9. 支持從完整 Prompt 使用小米 Mimo 大模型拆解成素材草稿。
10. 拆解結果必須經使用者確認、修改、刪除或保存，不得自動寫入素材庫。

## 4. 非目標

第一版明確不做：

1. AI 圖像生成。
2. 圖片模型選擇。
3. 生成圖片按鈕。
4. 圖片輸出格式選擇。
5. 積分、付款、訂閱。
6. 公開素材庫。
7. 公開 Gallery。
8. 分享、評論、收藏、作者頁。
9. 角色一致性工作流。
10. 參考圖工作流。
11. 圖片結構檢測。
12. AI 優化建議。

## 5. 核心概念

### 5.1 Prompt 素材

Prompt 素材是產品中最小的可重用單位。

欄位：

1. `id`
2. `category`
3. `title`
4. `subtitle`
5. `previewImagePath`
6. `prompt`
7. `negativePrompt`
8. `tags`
9. `notes`
10. `createdAt`
11. `updatedAt`

### 5.2 16 個素材分類

分類是固定 Prompt 結構槽位，不是普通標籤。

1. 人設
2. 表情
3. 姿態
4. 上裝
5. 下裝
6. 鞋履
7. 場景
8. 寫真風格
9. 光影
10. 畫面影響
11. 版式設計
12. 配飾
13. 道具
14. 鏡頭質感
15. 景別
16. 妝容

### 5.3 單選與多選分類

單選分類：

1. 人設
2. 表情
3. 姿態
4. 上裝
5. 下裝
6. 鞋履
7. 場景
8. 寫真風格
9. 光影
10. 鏡頭質感
11. 景別
12. 妝容

多選分類：

1. 畫面影響
2. 版式設計
3. 配飾
4. 道具

### 5.4 當前組合

當前組合是正在組裝的一條 Prompt。

它保存：

1. 16 個分類槽位的已選素材。
2. 尺寸參數。
3. 質量參數。
4. 編譯器模式：自動或自定義。
5. 自定義 Prompt 文本。

### 5.5 Gallery

Gallery 保存完整 Prompt 成品，而不是單個素材。

欄位：

1. `id`
2. `title`
3. `previewImagePath`
4. `prompt`
5. `sizePreset`
6. `qualityPreset`
7. `tags`
8. `notes`
9. `sourceCombinationSnapshot`
10. `createdAt`
11. `updatedAt`

`sourceCombinationSnapshot` 用於支持「套用到當前組合」。如果沒有 snapshot，Gallery 項目只能以自定義 Prompt 模式載入。

## 6. 頁面與功能需求

### 6.1 主工作台

主工作台是唯一主頁，包含：

1. 頂部標題區
2. 創作參數區
3. 當前組合區
4. Prompt 編譯器區
5. 我的 Gallery 區

### 6.2 創作參數區

尺寸使用下拉選單。

質量使用按鈕組。

尺寸與質量只是 Prompt 參數，不觸發任何圖片生成。

### 6.3 當前組合區

必須顯示 16 個分類槽位。

空槽位顯示分類名稱與「點擊選擇」提示。

已選槽位顯示：

1. 分類名稱
2. 預覽圖
3. 素材標題
4. 素材副標題
5. 取消選擇入口

點擊槽位打開大圖選擇器，並自動切換到該分類。

### 6.4 大圖選擇器

大圖選擇器使用彈窗或全屏 Dialog。

包含：

1. 標題欄
2. 搜索框
3. 新增素材入口
4. 粘貼 Prompt 導入入口
5. 16 分類切換
6. 標籤篩選
7. 素材卡片網格
8. 底部已選摘要

素材卡片顯示：

1. 圖片預覽或空預覽占位
2. 分類
3. 標題
4. 副標題
5. 標籤
6. Prompt 摘要
7. 已選狀態
8. 操作菜單

素材卡操作：

1. 選擇
2. 取消選擇
3. 查看完整 Prompt
4. 編輯素材
5. 複製素材 Prompt
6. 刪除素材

### 6.5 Prompt 編譯器

編譯器包含：

1. 完整 Prompt 文本框
2. 自動 / 自定義模式切換
3. 複製 Prompt
4. 重置
5. 保存到 Gallery

自動模式下，完整 Prompt 由當前組合按固定順序生成。

自定義模式下，使用者可以自由修改 Prompt，素材選擇變化不得覆蓋自定義內容，除非使用者明確切回自動模式。

編譯順序：

1. 人設
2. 表情
3. 姿態
4. 景別
5. 上裝
6. 下裝
7. 鞋履
8. 妝容
9. 配飾
10. 道具
11. 場景
12. 光影
13. 寫真風格
14. 鏡頭質感
15. 畫面影響
16. 版式設計
17. 尺寸
18. 質量

### 6.6 Gallery

Gallery 區包含：

1. 搜索框
2. 標籤篩選
3. 排序選項
4. Gallery 卡片列表

排序選項：

1. 最新創建
2. 最近更新
3. 標題排序

Gallery 卡片操作：

1. 打開詳情
2. 複製 Prompt
3. 套用到當前組合
4. 編輯
5. 拆解成素材
6. 刪除

## 7. Prompt 拆解需求

### 7.1 功能定位

Prompt 拆解只處理文字 Prompt，不處理圖片，不調用圖片生成模型。

使用者可以從兩個入口進入拆解：

1. 大圖選擇器中的「粘貼 Prompt 導入」。
2. Gallery 卡片中的「拆解成素材」。

### 7.2 模型供應商

Prompt 拆解採用小米 Mimo 大模型。

API 協議：

1. 兼容 OpenAI API protocol。
2. Base URL：`https://token-plan-sgp.xiaomimimo.com/v1`
3. API key 不得寫入前端代碼、文檔正文或版本庫，必須通過環境變數配置。

環境變數：

```bash
XIAOMI_MIMO_API_KEY=...
XIAOMI_MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1
XIAOMI_MIMO_MODEL=mimo-v2.5-pro
```

可選模型：

1. `mimo-v2.5-pro`
2. `mimo-v2.5`
3. `mimo-v2-pro`
4. `mimo-v2-omni`

默認模型建議使用 `mimo-v2.5-pro`，因為拆解需要穩定的語義理解與結構化輸出。`mimo-v2.5` 可作為成本或速度優先選項。`mimo-v2-omni` 暫不作為默認，因為 MVP 不處理圖片輸入。

### 7.3 拆解流程

1. 使用者貼入完整 Prompt。
2. 前端提交 Prompt 到後端 API route。
3. 後端調用小米 Mimo。
4. 模型返回結構化素材草稿。
5. 後端使用 Zod schema 驗證結果。
6. 如果結果不合法，嘗試一次修復請求或返回可讀錯誤。
7. 前端打開「確認拆解素材」彈窗。
8. 使用者逐項修改、刪除、保存。
9. 只有使用者確認保存的項目才寫入素材庫。

### 7.4 模型輸出 schema

模型輸出必須是 JSON。

```json
{
  "items": [
    {
      "category": "人設",
      "title": "短標題",
      "subtitle": "一句效果說明",
      "prompt": "可直接拼接進完整 Prompt 的片段",
      "negativePrompt": "",
      "tags": ["標籤一", "標籤二"],
      "notes": "拆解依據或使用建議"
    }
  ]
}
```

約束：

1. `category` 必須是 16 個固定分類之一。
2. `title` 必須簡短，適合素材卡展示。
3. `prompt` 不得為空。
4. `tags` 最多 8 個。
5. 不確定的內容應放入 `notes`，不得編造預覽圖。
6. 模型不得直接決定保存，保存權限只屬於使用者。

### 7.5 錯誤處理

拆解失敗時顯示明確錯誤：

1. API key 未配置。
2. 模型請求失敗。
3. 模型返回非 JSON。
4. 模型返回分類不合法。
5. 輸入 Prompt 為空或過短。

錯誤不應清空使用者已輸入 Prompt。

## 8. 技術棧

### 8.1 推薦方案

1. Next.js App Router
2. TypeScript
3. shadcn/ui
4. Tailwind CSS
5. React Hook Form
6. Zod
7. Zustand
8. Drizzle ORM
9. SQLite
10. 本機 filesystem 圖片存儲

### 8.2 選型理由

Next.js 適合把本地工作台、後端 API route、模型調用與資料存取放在同一個專案內。

shadcn/ui 適合高密度工具型界面，可以直接使用 Dialog、Sheet、Select、Tabs、ToggleGroup、Textarea、Card、Badge、Table、DropdownMenu、AlertDialog、Command、ScrollArea 和 sonner。

SQLite 適合單人自用、local-first、無需雲端部署的第一版。後續如果需要多設備同步，可以遷移到 Postgres。

Zustand 適合管理當前組合、選擇器狀態和編譯器模式，避免把所有臨時 UI 狀態寫入資料庫。

### 8.3 安全要求

1. 小米 Mimo API key 只允許存在於 `.env.local`。
2. `.env.local` 必須加入 `.gitignore`。
3. 前端不得直接調用 Mimo API。
4. 所有模型調用必須通過後端 API route。
5. 保存到 DB 前必須做 schema validation。

## 9. 資料模型草案

### 9.1 `prompt_atoms`

保存素材。

欄位：

1. `id`
2. `category`
3. `title`
4. `subtitle`
5. `preview_image_path`
6. `prompt`
7. `negative_prompt`
8. `tags_json`
9. `notes`
10. `created_at`
11. `updated_at`

### 9.2 `gallery_items`

保存完整 Prompt 成品。

欄位：

1. `id`
2. `title`
3. `preview_image_path`
4. `prompt`
5. `size_preset`
6. `quality_preset`
7. `tags_json`
8. `notes`
9. `combination_snapshot_json`
10. `created_at`
11. `updated_at`

### 9.3 `app_settings`

保存本地偏好。

欄位：

1. `key`
2. `value_json`
3. `updated_at`

可保存：

1. 默認尺寸
2. 默認質量
3. Prompt 拆解模型
4. Gallery 排序方式

## 10. API 路由草案

### 10.1 素材 API

1. `GET /api/atoms`
2. `POST /api/atoms`
3. `PATCH /api/atoms/:id`
4. `DELETE /api/atoms/:id`

### 10.2 Gallery API

1. `GET /api/gallery`
2. `POST /api/gallery`
3. `PATCH /api/gallery/:id`
4. `DELETE /api/gallery/:id`

### 10.3 圖片上傳 API

1. `POST /api/uploads`

限制：

1. 只接受圖片文件。
2. 保存到專案內 `data/uploads/`。
3. DB 只保存相對 path。

### 10.4 Prompt 拆解 API

1. `POST /api/prompt/parse`

Request：

```json
{
  "prompt": "完整 Prompt",
  "source": "paste",
  "model": "mimo-v2.5-pro"
}
```

Response：

```json
{
  "items": [
    {
      "category": "表情",
      "title": "俏皮自信微笑",
      "subtitle": "溫柔甜美看鏡頭",
      "prompt": "playful confident smile, soft sweet expression, looking directly at camera",
      "negativePrompt": "",
      "tags": ["俏皮", "甜美", "看鏡頭"],
      "notes": "由來源 Prompt 的表情描述拆解而來"
    }
  ]
}
```

## 11. UI 實作原則

1. 工具台應該是高密度、清楚、可掃描的操作界面，不做 landing page。
2. 主頁第一屏就要看到當前組合和 Prompt 編譯器。
3. 大圖選擇器是核心功能，應優先保證圖片卡片清楚、篩選順手、已選狀態明顯。
4. Dialog 必須有可訪問的 title。
5. 表單使用 shadcn Field / FieldGroup 模式。
6. 選項組使用 ToggleGroup，不用多個 Button 手寫 active state。
7. 刪除使用 AlertDialog 二次確認。
8. 複製成功使用 sonner toast。
9. 空狀態使用 Empty。
10. 載入狀態使用 Skeleton 或 Spinner。

## 12. 驗收標準

MVP 完成時應滿足：

1. 使用者可以新增至少一個素材，並在大圖選擇器中看到它。
2. 使用者可以按分類、標籤和搜索詞篩選素材。
3. 使用者可以選擇單選分類素材，並替換同分類舊素材。
4. 使用者可以選擇多選分類素材，並保留多個已選素材。
5. 當前組合可以正確顯示已選數量。
6. Prompt 編譯器可以按固定順序生成完整 Prompt。
7. 自定義模式不會被素材選擇自動覆蓋。
8. 複製 Prompt 後顯示成功提示。
9. 使用者可以保存完整 Prompt 到 Gallery。
10. Gallery 項目可以打開、複製、編輯、刪除。
11. 有組合 snapshot 的 Gallery 項目可以套用到當前組合。
12. 使用者可以貼入完整 Prompt 並調用小米 Mimo 拆解。
13. 拆解結果不會直接入庫，必須經使用者確認。
14. API key 不出現在前端 bundle、Git history 或文檔明文中。

## 13. 第一階段實作順序

1. 初始化 Next.js + TypeScript + shadcn/ui。
2. 建立分類常量、尺寸常量、質量常量。
3. 建立 SQLite + Drizzle schema。
4. 實作素材 CRUD。
5. 實作圖片上傳與預覽。
6. 實作當前組合 Zustand store。
7. 實作大圖選擇器。
8. 實作 Prompt 編譯器。
9. 實作 Gallery CRUD。
10. 實作 Gallery 套用到當前組合。
11. 實作小米 Mimo Prompt 拆解 API。
12. 實作確認拆解素材彈窗。
13. 做端到端驗收與資料持久化測試。

## 14. 已決策事項

1. 資料庫存放在專案內 `data/app.db`。
2. 上傳圖片與示例圖片存放在專案內 `data/uploads/`。
3. Prompt 拆解模型必須出現在 UI 中可切換，可選模型為 `mimo-v2.5-pro`、`mimo-v2.5`、`mimo-v2-pro`、`mimo-v2-omni`。
4. 第一版需要內建示例素材。示例素材圖片不得使用空白占位或外部未授權圖片，必須由 Codex 工作階段自帶的 image2 / GPT Image 2 圖片生成能力產生後保存到 `data/uploads/`，再與 seed atoms 綁定；這不是產品功能，不需要使用者提供 image2 API key，也不得在 app 內接入 image2 API。
5. MVP 可先不做自動壓縮與縮略圖生成，但圖片上傳必須限制文件類型與大小，並保證預覽穩定顯示。
