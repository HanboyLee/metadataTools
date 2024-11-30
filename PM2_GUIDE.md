# PM2 部署指南

本指南說明如何使用 PM2 進程管理器部署圖片元數據工具。

## 前置要求

- Node.js 18.x 或更高版本
- 全局安裝 PM2 (`npm install -g pm2`)
- Git
- OpenAI API 密鑰

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

3. 創建環境文件：
在根目錄創建 `.env.production` 文件：
```env
NEXT_PUBLIC_OPENAI_API_KEY=你的api密鑰
UPLOAD_DIR=./public/uploads
PROCESSED_DIR=./public/processed
NODE_ENV=production
```

4. 構建應用：
```bash
npm run build
```

## PM2 配置

項目包含一個 `ecosystem.config.js` 文件，配置如下：

```javascript
module.exports = {
  apps: [
    {
      name: 'image-metadata-tool',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
```

## 部署命令

1. 啟動應用：
```bash
pm2 start ecosystem.config.js
```

2. 監控應用：
```bash
pm2 monit
```

3. 查看日誌：
```bash
pm2 logs image-metadata-tool
```

4. 停止應用：
```bash
pm2 stop image-metadata-tool
```

5. 重啟應用：
```bash
pm2 restart image-metadata-tool
```

## 目錄結構

確保以下目錄存在並具有適當的權限：
```
public/
├── uploads/
├── processed/
├── temp/
└── images/
```

如果目錄不存在，創建它們：
```bash
mkdir -p public/{uploads,processed,temp,images}
```

## 監控

PM2 提供多種監控選項：

1. 基於網頁的監控：
```bash
pm2 plus
```

2. 基於終端的監控：
```bash
pm2 monit
```

3. 狀態檢查：
```bash
pm2 status
```

## 日誌管理

1. 查看日誌：
```bash
pm2 logs
```

2. 清除日誌：
```bash
pm2 flush
```

3. 查看特定應用日誌：
```bash
pm2 logs image-metadata-tool
```

## 啟動腳本

確保服務器重啟後應用自動啟動：

```bash
pm2 startup
pm2 save
```

## 故障排除

1. 如果應用無法啟動：
   - 檢查日誌：`pm2 logs image-metadata-tool`
   - 驗證環境變量
   - 檢查端口可用性
   - 驗證文件權限

2. 內存問題：
   - 監控內存使用：`pm2 monit`
   - 考慮在 ecosystem.config.js 中增加 Node.js 內存限制

3. 進程崩潰：
   - 檢查錯誤日誌
   - 驗證 OpenAI API 密鑰
   - 檢查上傳目錄的磁盤空間

## 安全注意事項

1. 文件權限：
```bash
chmod 755 public/{uploads,processed,temp,images}
```

2. 環境變量：
- 使用 PM2 環境文件
- 保護 .env.production 文件

3. 網絡安全：
- 配置防火牆規則
- 在生產環境使用 HTTPS
- 設置速率限制

## 備份策略

1. 定期備份：
   - 環境文件
   - 上傳的圖片
   - 處理後的數據
   - PM2 配置

2. 自動備份腳本示例：
```bash
#!/bin/bash
backup_dir="/path/to/backups/$(date +%Y%m%d)"
mkdir -p "$backup_dir"
cp .env.production "$backup_dir/"
cp ecosystem.config.js "$backup_dir/"
tar -czf "$backup_dir/public.tar.gz" public/
```

## 更新和維護

1. 更新應用：
```bash
git pull
npm install
npm run build
pm2 restart image-metadata-tool
```

2. 更新 PM2：
```bash
npm install pm2 -g
pm2 update
```

## 相關資源

- [PM2 官方文檔](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 GitHub](https://github.com/Unitech/pm2)
- [PM2 Plus 監控](https://app.pm2.io/)
