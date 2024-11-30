#!/bin/bash

# 創建部署包目錄
DEPLOY_DIR="deployment-package"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# 複製必要文件
cp -r .next $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp .env.production $DEPLOY_DIR/
cp ecosystem.config.js $DEPLOY_DIR/
cp DEPLOYMENT.md $DEPLOY_DIR/

# 創建必要的目錄
mkdir -p $DEPLOY_DIR/public/uploads
mkdir -p $DEPLOY_DIR/public/processed

# 創建壓縮包
tar -czf image-metadata-tool-deployment.tar.gz $DEPLOY_DIR

# 清理臨時目錄
rm -rf $DEPLOY_DIR

echo "部署包已創建: image-metadata-tool-deployment.tar.gz"
