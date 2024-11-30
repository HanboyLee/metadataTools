# 圖片元數據工具

一個使用 OpenAI GPT Vision API 來分析圖片並提取有意義元數據的 Next.js Web 應用程序，可將結果導出為 CSV 格式。

## 功能特點

- 支持多圖片上傳
- 使用 OpenAI GPT Vision API 進行 AI 圖片分析
- 自動生成元數據：
  - 標題（最多 70 字符）
  - 描述（最多 200 字符）
  - 關鍵詞（逗號分隔）
- 實時分析進度追踪
- CSV 導出功能
- 使用 Material-UI 構建的現代響應式界面

## 在線演示

訪問我們的在線演示：[https://image-metadata-tool-r9xmdm6l1-hanboylees-projects.vercel.app](https://image-metadata-tool-r9xmdm6l1-hanboylees-projects.vercel.app)

## 系統要求

- Node.js 18.x 或更高版本
- OpenAI API 密鑰
- Vercel 帳號（用於部署）

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
創建 `.env.local` 文件用於本地開發：
```env
NEXT_PUBLIC_OPENAI_API_KEY=你的api密鑰
UPLOAD_DIR=./public/uploads
PROCESSED_DIR=./public/processed
NODE_ENV=development
```

4. 啟動開發服務器：
```bash
npm run dev
```

5. 在瀏覽器中打開 [http://localhost:8080](http://localhost:8080)

## 部署

### Vercel 部署

1. 將代碼推送到 GitHub
2. 將倉庫連接到 Vercel
3. 在 Vercel 中配置環境變量：
   - `NEXT_PUBLIC_OPENAI_API_KEY`
   - `UPLOAD_DIR`
   - `PROCESSED_DIR`
   - `NODE_ENV`
4. 使用 Vercel CLI 部署：
```bash
npx vercel --prod
```

### 本地生產環境構建

測試生產環境構建：
```bash
npm run build
npm start
```

## 依賴項

- Next.js 13.5.6
- React 18.2.0
- Material-UI 5.15.0
- OpenAI SDK
- TypeScript
- ESLint

## 目錄結構

```
.
├── public/
│   ├── uploads/    # 上傳圖片的臨時存儲
│   ├── processed/  # 處理後圖片的存儲
│   ├── temp/       # 臨時工作目錄
│   └── images/     # 靜態圖片
├── src/
│   └── app/
│       ├── analyzer/      # 圖片分析組件
│       ├── api/          # API 路由
│       └── metadata-management/  # 元數據管理組件
└── ...
```

## 使用方法

1. 輸入 OpenAI API 密鑰（如果未在 .env 中配置）
2. 上傳一張或多張圖片（支持格式：JPEG, PNG）
3. 等待 AI 分析完成
4. 查看每張圖片生成的元數據
5. 將結果導出為 CSV 格式

## CSV 導出格式

導出的 CSV 文件包含以下列：
- 文件名：原始圖片文件名
- 標題：AI 生成的標題
- 描述：AI 生成的描述
- 關鍵詞：AI 生成的關鍵詞（逗號分隔）

## 錯誤處理

應用程序處理各種情況：
- API 認證錯誤
- 網絡連接問題
- 無效文件格式
- 處理失敗
- 速率限制

## 文檔

- [需求規格說明（英文）](./REQUIREMENTS.md)
- [需求規格說明（中文）](./REQUIREMENTS_CN.md)
- [PM2 部署指南](./PM2_GUIDE.md)

## 安全考慮

- API 密鑰安全存儲在環境變量中
- 客戶端圖片處理
- 無永久數據存儲
- 安全數據傳輸
- 文件上傳驗證和清理

## 生產環境注意事項

- 使用雲存儲（如 AWS S3）用於生產部署
- 實現 API 端點速率限制
- 設置適當的監控和日誌記錄
- 配置適當的 CORS 策略
- 定期安全更新

## 許可證

MIT

## 貢獻

1. Fork 倉庫
2. 創建特性分支
3. 提交更改
4. 推送到分支
5. 創建 Pull Request
