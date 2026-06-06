# Local Data

Prompt 視覺化素材工作台是 local-first app。資料預設只保存在本機專案目錄。

## Paths

- `data/app.db`: SQLite database，保存素材、Gallery 和設定。
- `data/uploads/`: 使用者上傳圖片。
- `data/uploads/seed/`: 內建 seed 預覽圖片，可提交到 repo。

## Backup

備份時請同時複製：

```text
data/app.db
data/uploads/
```

只備份 DB 會遺失使用者上傳圖片；只備份 uploads 會遺失素材、Gallery 和設定。

## Git Safety

`.gitignore` 會忽略：

- `.env.local`
- `data/app.db`
- SQLite journal/WAL/SHM files
- `data/uploads/` 下的非 seed 上傳圖片

`data/uploads/seed/` 是例外，因為 seed 圖片是產品 starter library 的一部分。

## Reset

若需要重建本機空資料庫，先停止 dev server，再備份或移走 `data/app.db` 和相關 SQLite WAL/SHM 檔。下一次啟動 app 並讀取素材 API 時會重新建立 schema 並 bootstrap seed atoms。
