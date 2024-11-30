# Vercel 部署指南

本指南提供了將圖片元數據工具部署到 Vercel 的詳細說明。

## 前置要求

- Vercel 帳號
- GitHub 帳號
- OpenAI API 密鑰

## 部署步驟

### 1. 準備你的倉庫

1. 確保代碼已推送到 GitHub
2. 驗證所有必要文件是否存在：
   - `vercel.json`
   - `.env.production`
   - `public/` 目錄下的必要目錄

### 2. 配置 Vercel 項目

1. 登錄 [Vercel 控制台](https://vercel.com/dashboard)
2. 點擊 "New Project"
3. 導入你的 GitHub 倉庫
4. 配置項目設置：
   - 框架預設：Next.js
   - 根目錄：./
   - 構建命令：`next build`
   - 輸出目錄：.next

### 3. 環境變量

在 Vercel 項目設置中設置以下環境變量：

```env
NEXT_PUBLIC_OPENAI_API_KEY=你的api密鑰
UPLOAD_DIR=./public/uploads
PROCESSED_DIR=./public/processed
NODE_ENV=production
```

### 4. 部署

#### 方式一：Vercel 控制台

1. 點擊 "Deploy"
2. 等待構建完成
3. 訪問已部署的應用

#### 方式二：Vercel CLI

1. 安裝 Vercel CLI：
```bash
npm i -g vercel
```

2. 登錄 Vercel：
```bash
vercel login
```

3. 部署：
```bash
vercel --prod
```

## 項目配置

### vercel.json

```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "env": {
    "UPLOAD_DIR": "./public/uploads",
    "PROCESSED_DIR": "./public/processed",
    "NODE_ENV": "production"
  }
}
```

### 目錄結構

```
.
├── public/
│   ├── uploads/    # 上傳圖片的臨時存儲
│   ├── processed/  # 處理後圖片的存儲
│   ├── temp/       # 臨時工作目錄
│   └── images/     # 靜態圖片
└── ...
```

## 部署後步驟

1. 驗證環境變量是否正確設置
2. 測試圖片上傳功能
3. 檢查 API 端點
4. 監控構建日誌
5. 設置自定義域名（可選）

## 故障排除

### 常見問題

1. 構建失敗
   - 檢查 Vercel 控制台中的構建日誌
   - 驗證依賴項是否正確指定
   - 確保所有必需的環境變量都已設置

2. 運行時錯誤
   - 檢查 Vercel 控制台中的函數日誌
   - 驗證 API 端點是否正常工作
   - 檢查 OpenAI API 密鑰是否有效

3. 文件上傳問題
   - 驗證目錄權限
   - 檢查文件大小限制
   - 確保路徑配置正確

### 解決方案

1. 構建失敗解決：
   - 清除構建緩存並重新部署
   - 更新依賴項
   - 檢查 Next.js 版本兼容性

2. 運行時錯誤解決：
   - 驗證環境變量
   - 檢查 API 速率限制
   - 監控服務器日誌

3. 文件上傳問題解決：
   - 考慮使用雲存儲
   - 調整文件大小限制
   - 檢查路徑配置

## 生產環境注意事項

1. 性能
   - 啟用緩存
   - 優化圖片處理
   - 使用 CDN 處理靜態資源

2. 安全性
   - 設置 CORS 策略
   - 實現速率限制
   - 保護 API 端點

3. 監控
   - 設置錯誤追踪
   - 監控 API 使用情況
   - 追踪性能指標

## 維護

1. 定期更新
   - 保持依賴項更新
   - 監控安全公告
   - 更新 OpenAI API 版本

2. 備份
   - 定期數據庫備份
   - 環境變量備份
   - 配置備份

3. 監控
   - 設置運行時間監控
   - 配置錯誤警報
   - 監控資源使用情況

## 相關資源

- [Vercel 文檔](https://vercel.com/docs)
- [Next.js 文檔](https://nextjs.org/docs)
- [OpenAI API 文檔](https://platform.openai.com/docs)
