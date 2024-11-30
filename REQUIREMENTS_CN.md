# 图像元数据工具 - 需求规格说明书

## 1. 项目概述

### 1.1 目的
图像元数据工具是一个基于网络的应用程序，使用人工智能技术分析图像并提取有意义的元数据。该工具利用 OpenAI 的 GPT Vision API 生成图像的描述性信息，并将数据导出为 CSV 格式。

### 1.2 范围
该应用程序提供用户界面，支持多图片上传、AI 分析，并以结构化格式导出分析结果。

## 2. 功能需求

### 2.1 图片上传
- 支持同时上传多个图片
- 接受常见图片格式（JPEG、PNG 等）
- 上传过程中提供视觉反馈
- 上传前验证文件类型和大小

### 2.2 图片分析
- 集成 OpenAI 的 GPT Vision API
- 为每张图片生成以下元数据：
  - 标题（最多 70 个字符）
  - 描述（最多 200 个字符）
  - 关键词（逗号分隔）
- 按顺序处理多张图片
- 优雅处理 API 错误
- 显示分析进度

### 2.3 结果管理
- 实时显示分析结果
- 为每张图片显示以下信息：
  - 原始文件名
  - 生成的标题
  - 生成的描述
  - 生成的关键词
- 显示每张图片的成功/失败状态
- 支持将结果导出为 CSV 格式

### 2.4 CSV 导出
- 将所有成功的分析结果导出为 CSV
- CSV 格式包含：
  - 文件名
  - 标题
  - 描述
  - 关键词
- 正确处理特殊字符和 CSV 格式
- 生成带时间戳的导出文件名

### 2.5 API 密钥管理
- 允许用户输入 OpenAI API 密钥
- 会话期间安全存储 API 密钥
- 验证 API 密钥格式
- 处理 API 认证错误

## 3. 非功能需求

### 3.1 性能
- 高效处理多张图片
- 处理过程中保持界面响应
- 优化 API 请求的图片处理
- 能够处理大批量图片而不崩溃

### 3.2 安全性
- 安全处理 API 密钥
- 客户端图片处理
- 不永久存储敏感数据
- 安全的数据传输

### 3.3 可用性
- 清晰直观的用户界面
- 明确的错误信息
- 长时间操作的进度指示
- 适应不同屏幕尺寸的响应式设计

### 3.4 可靠性
- 优雅的错误处理
- 从 API 失败中恢复
- 所有步骤的数据验证
- 导出过程中不丢失数据

## 4. 技术需求

### 4.1 前端
- Next.js 框架
- React 组件
- Material-UI 界面元素
- TypeScript 类型安全

### 4.2 API 集成
- OpenAI GPT Vision API
- Base64 图片编码
- JSON 响应解析
- 错误处理和重试机制

### 4.3 数据处理
- CSV 生成
- 图片格式处理
- 内存管理
- 数据验证

## 5. 限制条件

### 5.1 技术限制
- 浏览器兼容性要求
- API 速率限制
- 图片大小限制
- 网络带宽考虑

### 5.2 业务限制
- OpenAI API 成本
- 用户提供 API 密钥
- 处理时间限制
- 数据隐私要求

## 6. 未来考虑

### 6.1 潜在增强
- 批处理优化
- 额外的元数据字段
- 自定义分析参数
- 结果缓存
- 替代 AI 模型支持

### 6.2 可扩展性
- 处理更大的图片集
- 提升性能
- 额外的导出格式
- 增强错误日志

## 7. 文档要求

### 7.1 用户文档
- 安装说明
- 使用指南
- API 密钥设置
- 故障排除指南

### 7.2 技术文档
- 代码文档
- API 集成详情
- 开发环境设置
- 部署流程

## 8. 开发环境

### 8.1 技术栈
- Next.js 15.0.3
- React 19.0.0-rc
- Material-UI 最新版
- OpenAI SDK 最新版

### 8.2 开发工具
- TypeScript
- ESLint
- Git 版本控制
- npm 包管理

## 9. 项目时间线

### 9.1 当前进度
- 基础功能实现完成
- 图片上传功能
- AI 分析集成
- CSV 导出

### 9.2 下一步计划
- 完善错误处理
- 优化用户界面
- 增加批处理功能
- 改进导出功能