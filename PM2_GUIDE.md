# PM2 使用指南

## 簡介
PM2 是一個強大的 Node.js 應用程序進程管理器，它可以幫助你管理和保持應用程序 24/7 運行。本指南將介紹如何使用 PM2 來部署和管理我們的圖片元數據工具。

## 安裝
```bash
# 全局安裝 PM2
npm install -g pm2
```

## 基本命令

### 啟動應用
```bash
# 使用配置文件啟動
pm2 start ecosystem.config.js

# 直接啟動（不推薦）
pm2 start npm --name "metadata-tool" -- start
```

### 查看應用狀態
```bash
# 查看所有應用狀態
pm2 list

# 查看詳細信息
pm2 show metadata-tool

# 查看日誌
pm2 logs metadata-tool
```

### 管理應用
```bash
# 重啟應用
pm2 restart metadata-tool

# 停止應用
pm2 stop metadata-tool

# 刪除應用
pm2 delete metadata-tool

# 重載應用（零停機重啟）
pm2 reload metadata-tool
```

## 配置文件說明
我們的 `ecosystem.config.js` 配置如下：

```javascript
module.exports = {
  apps: [{
    name: 'metadata-tool',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      UPLOAD_DIR: './public/uploads',
      PROCESSED_DIR: './public/processed'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

### 配置參數說明
- `name`: 應用名稱
- `script`: 啟動腳本
- `args`: 腳本參數
- `env`: 環境變量
- `instances`: 實例數量
- `autorestart`: 是否自動重啟
- `watch`: 是否監視文件變化
- `max_memory_restart`: 內存限制

## 監控和維護

### 監控儀表板
```bash
# 啟動 Web 介面
pm2 plus
```

### 日誌管理
```bash
# 查看實時日誌
pm2 logs

# 查看特定應用日誌
pm2 logs metadata-tool

# 清空日誌
pm2 flush
```

### 自動啟動
```bash
# 生成啟動腳本
pm2 startup

# 保存當前應用列表
pm2 save
```

## 常見問題處理

### 1. 應用崩潰
檢查日誌文件：
```bash
pm2 logs metadata-tool --lines 100
```

### 2. 內存洩漏
監控內存使用：
```bash
pm2 monit
```

### 3. 性能問題
使用內置分析工具：
```bash
pm2 reload metadata-tool --profile
```

## 最佳實踐

1. **總是使用配置文件**
   - 使用 `ecosystem.config.js` 而不是命令行參數
   - 將所有配置集中管理

2. **正確設置環境變量**
   - 使用 `.env` 文件管理敏感信息
   - 在配置文件中設置常用環境變量

3. **日誌管理**
   - 定期清理日誌
   - 設置日誌輪轉
   - 監控錯誤日誌

4. **監控**
   - 定期檢查應用狀態
   - 設置自動重啟閾值
   - 使用 PM2 Plus 進行高級監控

## 更新和維護

### 更新 PM2
```bash
# 更新 PM2
npm install pm2@latest -g

# 更新內存快照
pm2 update
```

### 備份
```bash
# 保存進程列表
pm2 save

# 備份配置文件
cp ecosystem.config.js ecosystem.config.backup.js
```

## 安全建議

1. 避免使用 root 用戶運行 PM2
2. 正確設置文件權限
3. 使用環境變量存儲敏感信息
4. 定期更新 PM2 和依賴包

## 相關資源

- [PM2 官方文檔](https://pm2.keymetrics.io/)
- [PM2 GitHub](https://github.com/Unitech/pm2)
- [PM2 Plus 監控](https://app.pm2.io/)
