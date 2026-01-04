# 下克上小助手 - 数据爬取工具

这个工具用于从线上服务器爬取所有游戏数据，保存为JSON文件。

## 使用方法

### 1. 安装依赖

在此目录下打开命令行，运行：

```bash
npm install
```

### 2. 运行爬取工具

```bash
npm run scrape
```

或者：

```bash
node scraper.js
```

### 3. 按提示操作

1. 输入服务器地址，例如：`https://kfcvme50.zeabur.app`
2. 输入管理员代码
3. 等待数据爬取完成
4. 数据会保存到 `exported-data-YYYY-MM-DDTHH-MM-SS.json` 文件

## 导出的数据内容

导出的JSON文件包含以下数据：

- `gameState` - 游戏状态（当前年份、锁定状态）
- `territories` - 所有郡国数据
- `factions` - 所有势力数据（包含代码）
- `legions` - 所有军团数据
- `samurais` - 所有武士数据
- `specialProducts` - 所有特产配置
- `initialData` - 初始数据（用于重置）
- `operationRecords` - 操作记录
- `accountingLogs` - 记账日志

## 注意事项

- 请确保网络连接正常
- 需要管理员权限才能爬取数据
- 导出的文件包含敏感信息（如势力代码），请妥善保管
- 建议在更新程序前先导出数据备份

## 数据恢复

导出的数据可以通过程序的"数据导入"功能恢复。
