# 胡豆豆的專屬吃飯工具

一個基於 Next.js 的 Web 應用程序，用於批量處理圖片元數據，支持通過 CSV 文件進行批量修改。

## 功能特點

- 支持多圖片上傳和批量處理
- CSV 文件驅動的元數據修改
- AI 圖片分析功能：
  - 自動識別圖片內容
  - 智能生成標題和描述
  - 關鍵詞推薦
  - 批量分析處理
- 支持的元數據字段：
  - 標題（Title）
  - 描述（Description）
  - 關鍵詞（Keywords）
- 使用 Material-UI 構建的現代響應式界面
- 支持批量下載處理後的圖片

## 系統要求

- Node.js 18.x 或更高版本
- npm 或 yarn 包管理器

## 安裝步驟

1. 克隆倉庫：
```bash
git clone [repository-url]
cd image-metadata-tool
```

2. 安裝依賴：
```bash
npm install
```

3. 設置環境變量：
創建 `.env.local` 文件：
```env
CLEANUP_INTERVAL_MS=3600000
MAX_STORAGE_SIZE=104857600
FILE_MAX_AGE=86400000
```

4. 啟動開發服務器：
```bash
npm run dev
```

5. 在瀏覽器中訪問 [http://localhost:3000](http://localhost:3000)

## CSV 文件格式要求

CSV 文件必須包含以下列：
- filename：圖片文件名（必須與上傳的圖片文件名完全匹配）
- title：圖片標題
- description：圖片描述
- keywords：關鍵詞（使用逗號或分號分隔）

示例：
```csv
filename,title,description,keywords
image1.jpg,美麗風景,這是一張美麗的風景照片,風景,自然,攝影
```

## 使用說明

1. 準備 CSV 文件，確保符合上述格式要求
2. 選擇要處理的圖片文件（支持多選）
3. 上傳 CSV 文件
4. 等待處理完成
5. 點擊下載按鈕獲取處理後的圖片

## 目錄結構

```
.
├── public/
│   ├── images/     # 上傳的原始圖片
│   ├── processed/  # 處理後的圖片
│   └── temp/       # 臨時文件（如 ZIP）
├── src/
│   ├── app/
│   │   ├── api/    # API 路由
│   │   └── metadata-management/  # 主頁面
│   └── utils/      # 工具函數
```

## 依賴項

- Next.js 13+
- React 18+
- Material-UI 5+
- TypeScript
- node-cron（文件清理）
- jszip（ZIP 文件生成）

## 配置說明

環境變量說明：
- `CLEANUP_INTERVAL_MS`：清理間隔（毫秒）
- `MAX_STORAGE_SIZE`：最大存儲空間（字節）
- `FILE_MAX_AGE`：文件最大保存時間（毫秒）

## 注意事項

- 處理完成後的文件會在指定時間後自動清理
- 請確保上傳的 CSV 文件中的文件名與實際圖片文件名完全匹配
- 建議定期清理臨時文件夾

## 文檔

- [需求規格說明（英文）](./REQUIREMENTS.md)
- [需求規格說明（中文）](./REQUIREMENTS_CN.md)

## 許可證

MIT

## 貢獻

1. Fork 倉庫
2. 創建特性分支
3. 提交更改
4. 推送到分支
5. 創建 Pull Request
