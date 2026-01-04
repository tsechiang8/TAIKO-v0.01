/**
 * 下克上小助手 - 数据爬取工具
 * 
 * 使用方法：
 * 1. 在此目录运行: npm install
 * 2. 运行: node scraper.js
 * 3. 按提示输入服务器地址和管理员代码
 * 4. 数据将保存到 exported-data.json
 */

const fetch = require('node-fetch');
const fs = require('fs');
const readline = require('readline');

// 创建命令行交互接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// 存储session ID（用于Authorization header）
let sessionId = '';

/**
 * 发送API请求
 */
async function apiRequest(baseUrl, endpoint, method = 'GET', body = null) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // 如果有sessionId，添加到Authorization header
  if (sessionId) {
    headers['Authorization'] = `Bearer ${sessionId}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`请求失败: ${endpoint}`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 管理员登录
 */
async function adminLogin(baseUrl, adminCode) {
  console.log('\n正在登录管理员账户...');
  const result = await apiRequest(baseUrl, '/api/auth/login', 'POST', {
    code: adminCode,
  });
  
  // 检查登录结果 - 注意返回格式是 data.userType 和 data.sessionId
  if (result.success && result.data && result.data.userType === 'admin') {
    // 保存sessionId用于后续请求
    sessionId = result.data.sessionId;
    console.log('✓ 管理员登录成功');
    return true;
  } else {
    console.error('✗ 登录失败:', result.error || '未知错误');
    if (result.data) {
      console.log('  返回数据:', JSON.stringify(result.data));
    }
    return false;
  }
}

/**
 * 爬取所有数据
 */
async function scrapeAllData(baseUrl) {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {}
  };
  
  console.log('\n开始爬取数据...\n');
  
  // 1. 获取游戏状态
  console.log('正在获取游戏状态...');
  const gameStatus = await apiRequest(baseUrl, '/api/game/status');
  if (gameStatus.success) {
    exportData.data.gameState = gameStatus.data;
    console.log(`  ✓ 当前年份: ${gameStatus.data.currentYear}, 锁定状态: ${gameStatus.data.isLocked}`);
  }
  
  // 2. 获取所有郡国数据
  console.log('正在获取郡国数据...');
  const territories = await apiRequest(baseUrl, '/api/admin/territories');
  if (territories.success) {
    exportData.data.territories = territories.data;
    console.log(`  ✓ 获取到 ${territories.data.length} 个郡国`);
  }
  
  // 3. 获取所有势力完整数据
  console.log('正在获取势力数据...');
  const factions = await apiRequest(baseUrl, '/api/admin/factions/full');
  if (factions.success) {
    exportData.data.factions = factions.data;
    console.log(`  ✓ 获取到 ${factions.data.length} 个势力`);
  }
  
  // 4. 获取所有军团数据
  console.log('正在获取军团数据...');
  const legions = await apiRequest(baseUrl, '/api/admin/legions');
  if (legions.success) {
    exportData.data.legions = legions.data;
    console.log(`  ✓ 获取到 ${legions.data.length} 个军团`);
  }
  
  // 5. 获取所有特产数据
  console.log('正在获取特产数据...');
  const specialProducts = await apiRequest(baseUrl, '/api/admin/special-products');
  if (specialProducts.success) {
    exportData.data.specialProducts = specialProducts.data;
    console.log(`  ✓ 获取到 ${specialProducts.data.length} 个特产`);
  }
  
  // 6. 获取每个势力的武士数据
  console.log('正在获取武士数据...');
  const allSamurais = [];
  if (factions.success && factions.data) {
    for (const faction of factions.data) {
      const samurais = await apiRequest(baseUrl, `/api/admin/factions/${faction.id}/samurais`);
      if (samurais.success && samurais.data) {
        allSamurais.push(...samurais.data);
      }
    }
  }
  exportData.data.samurais = allSamurais;
  console.log(`  ✓ 获取到 ${allSamurais.length} 个武士`);
  
  // 7. 获取初始数据状态
  console.log('正在获取初始数据...');
  const initialData = await apiRequest(baseUrl, '/api/game/initial-data');
  if (initialData.success) {
    exportData.data.initialData = initialData.data;
    console.log(`  ✓ 获取到初始数据 (${initialData.data.territories?.length || 0} 个郡国)`);
  }
  
  // 8. 获取操作记录
  console.log('正在获取操作记录...');
  const operations = await apiRequest(baseUrl, '/api/game/operations?limit=100');
  if (operations.success) {
    exportData.data.operationRecords = operations.data;
    console.log(`  ✓ 获取到 ${operations.data.length} 条操作记录`);
  }
  
  // 9. 获取记账日志
  console.log('正在获取记账日志...');
  const accountingLogs = await apiRequest(baseUrl, '/api/game/accounting-logs');
  if (accountingLogs.success) {
    exportData.data.accountingLogs = accountingLogs.data;
    console.log(`  ✓ 获取到 ${accountingLogs.data.length} 条记账日志`);
  }
  
  return exportData;
}

/**
 * 保存数据到文件
 */
function saveToFile(data, filename) {
  const jsonStr = JSON.stringify(data, null, 2);
  fs.writeFileSync(filename, jsonStr, 'utf-8');
  console.log(`\n✓ 数据已保存到: ${filename}`);
  console.log(`  文件大小: ${(jsonStr.length / 1024).toFixed(2)} KB`);
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('   下克上小助手 - 数据爬取工具');
  console.log('========================================\n');
  
  // 获取服务器地址
  let baseUrl = await question('请输入服务器地址 (例如 https://kfcvme50.zeabur.app): ');
  baseUrl = baseUrl.trim();
  
  // 移除末尾的斜杠
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  
  // 获取管理员代码
  const adminCode = await question('请输入管理员代码: ');
  
  // 登录
  const loginSuccess = await adminLogin(baseUrl, adminCode.trim());
  if (!loginSuccess) {
    console.log('\n登录失败，程序退出。');
    rl.close();
    return;
  }
  
  // 爬取数据
  const exportData = await scrapeAllData(baseUrl);
  
  // 生成文件名（包含时间戳）
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `exported-data-${timestamp}.json`;
  
  // 保存数据
  saveToFile(exportData, filename);
  
  // 显示数据摘要
  console.log('\n========== 数据摘要 ==========');
  console.log(`游戏年份: ${exportData.data.gameState?.currentYear || '未知'}`);
  console.log(`郡国数量: ${exportData.data.territories?.length || 0}`);
  console.log(`势力数量: ${exportData.data.factions?.length || 0}`);
  console.log(`军团数量: ${exportData.data.legions?.length || 0}`);
  console.log(`武士数量: ${exportData.data.samurais?.length || 0}`);
  console.log(`特产数量: ${exportData.data.specialProducts?.length || 0}`);
  console.log('================================\n');
  
  console.log('爬取完成！请妥善保存导出的数据文件。');
  console.log('更新程序后，可以使用导入功能恢复数据。\n');
  
  rl.close();
}

// 运行主函数
main().catch(error => {
  console.error('程序出错:', error);
  rl.close();
});
