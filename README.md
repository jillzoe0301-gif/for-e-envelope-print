# FOR-e 信封列印系統

## 上線方式

### GitHub + Vercel

1. 建立新的 GitHub Repository，例如：
   `for-e-envelope-print-system`

2. 上傳本資料夾全部檔案。

3. 到 Vercel 新增專案，選擇此 GitHub Repository。

4. Vercel 設定：
   - Framework Preset：Vite
   - Build Command：`npm run build`
   - Output Directory：`dist`

5. Deploy 後，首頁網址即可使用：
   `/`

## 主要檔案

- `public/index.html`：正式首頁
- `public/for-e-envelope-print-system.html`：備用入口

## 功能

- 小信封：120 × 246 mm
- 中信封：172 × 237 mm
- 大信封：248 × 359 mm
- 範本下拉選單
- 儲存範本
- 匯出 / 匯入範本
- 列印時只印文字，不印背景
