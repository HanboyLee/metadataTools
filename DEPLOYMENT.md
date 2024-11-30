# Image Metadata Tool 部署指南

## 必要文件
需要以下文件和目錄：

```
image-metadata-tool/
├── .next/                 # 構建後的文件
├── public/               # 公共資源目錄
│   ├── uploads/         # 上傳目錄
│   └── processed/       # 處理後的文件目錄
├── package.json         # 項目配置和依賴
├── package-lock.json    # 依賴版本鎖定
├── .env.production      # 生產環境配置
└── ecosystem.config.js  # PM2 配置文件
```

## 部署步驟

1. **環境要求**
   - Node.js 18.x 或更高版本
   - npm 9.x 或更高版本
   - PM2 (用於進程管理)

2. **安裝步驟**
   ```bash
   # 安裝依賴
   npm install

   # 安裝 PM2
   npm install -g pm2
   ```

3. **環境配置**
   編輯 `.env.production` 文件：
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
   PORT=8080
   NODE_ENV=production
   UPLOAD_DIR=./public/uploads
   PROCESSED_DIR=./public/processed
   ```

4. **啟動應用**
   ```bash
   # 使用 PM2 啟動
   pm2 start ecosystem.config.js
   ```

5. **訪問應用**
   應用將在 http://localhost:8080 運行

## 常用命令

```bash
# 查看應用狀態
pm2 status

# 查看日誌
pm2 logs image-metadata-tool

# 重啟應用
pm2 restart image-metadata-tool

# 停止應用
pm2 stop image-metadata-tool

# 刪除應用
pm2 delete image-metadata-tool
```

## 注意事項

1. 確保 `uploads` 和 `processed` 目錄有正確的讀寫權限
2. 需要設置正確的 OpenAI API Key
3. 如果要修改端口，需要同時修改 `.env.production` 和 `ecosystem.config.js`
4. 建議使用 nginx 作為反向代理

## 故障排除

1. 如果應用無法啟動，檢查：
   - 端口是否被占用
   - 環境變量是否正確設置
   - Node.js 版本是否符合要求

2. 如果無法上傳文件，檢查：
   - 目錄權限
   - 磁盤空間
   - 文件大小限制

## 支持

如有問題，請聯繫技術支持。
