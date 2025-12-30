# Requirements Document

## Introduction

本文档定义了下克上小助手的系统更新需求，包括移动端适配、商业投资系统重构、投资确认机制、数值调整、回溯与重置系统、以及管理员安全密钥功能。

## Glossary

- **System**: 下克上小助手应用程序
- **DataTable**: 通用数据表格组件，用于显示郡国、武士等列表数据
- **Investment_Panel**: 投资面板组件，处理农业、商业、水军、武备四种投资
- **Commerce_Investment**: 商业投资子系统，一次性投资开发特产
- **Territory**: 郡国数据实体，包含石高、特产等信息
- **Samurai**: 武士数据实体，包含武功、文治等属性
- **Rollback_System**: 回溯系统，将数据恢复到指定操作后的状态
- **Reset_System**: 重置系统，将游戏数据恢复到初始状态
- **Admin_Code**: 管理员登录代码
- **Security_Key**: 安全密钥，复杂的备用管理员登录凭证
- **Developable_Product**: 可开发特产，郡国中尚未开发的潜在特产
- **Special_Product**: 特产，已开发并产生收益的产品

## Requirements

### Requirement 1: 移动端表格适配

**User Story:** As a 玩家, I want 在手机上正常查看郡国和武士列表, so that 我可以在移动设备上使用应用。

#### Acceptance Criteria

1. THE DataTable SHALL 支持水平滚动以显示所有列内容
2. THE DataTable SHALL 支持垂直滚动以显示所有行数据
3. THE DataTable SHALL 强制所有单元格文本完整显示，禁止文本折叠或截断
4. WHEN 表格内容超出屏幕宽度, THE DataTable SHALL 显示水平滚动条
5. WHEN 用户在移动端查看表格, THE DataTable SHALL 保持表头固定且可见
6. THE DataTable SHALL 设置单元格最小宽度以确保内容可读

### Requirement 2: 商业投资系统重构

**User Story:** As a 玩家, I want 通过商业投资开发郡国的可开发特产, so that 我可以增加领地收益。

#### Acceptance Criteria

1. WHEN 玩家进行商业投资, THE Commerce_Investment SHALL 要求选择目标郡国
2. WHEN 玩家进行商业投资, THE Commerce_Investment SHALL 要求选择执行武将
3. WHEN 玩家进行商业投资, THE Commerce_Investment SHALL 提供投资石数设定界面（滑条+数值输入）
4. THE Commerce_Investment SHALL 设定最低投资额为1000石
5. THE Commerce_Investment SHALL 实时显示计算后的成功率
6. THE Commerce_Investment SHALL 将成功率限制在5%-95%范围内
7. WHEN 武将文治为100且投入50000石, THE Commerce_Investment SHALL 计算原始成功率为100%，但因上限限制实际显示为95%
8. WHEN 武将文治为40或以下且投入1000石, THE Commerce_Investment SHALL 计算成功率为5%（下限）
9. THE Commerce_Investment SHALL 使用以下成功率公式：原始成功率 = 基础成功率 + (文治 - 基准值) × 系数 + (投入金额 - 基准金额) × 系数
9. WHEN 系统投掷的随机数（1-100）小于等于5, THE Commerce_Investment SHALL 触发大成功并退还50%投入资金
10. WHEN 目标郡国无可开发特产且判定成功, THE Commerce_Investment SHALL 反馈"此地并无新商机"并消耗资金
11. WHEN 目标郡国有可开发特产且判定成功, THE Commerce_Investment SHALL 反馈"开发了特产【名称】，下月起开始产出收益"并将可开发特产添加至特产列表
12. WHEN 目标郡国有可开发特产且判定失败, THE Commerce_Investment SHALL 反馈"似乎有关于【名称】的传闻，但投入资金不足，未能形成产业"并消耗资金
13. WHEN 目标郡国无可开发特产且判定失败, THE Commerce_Investment SHALL 反馈"没有打探到有价值的情报"并消耗资金

### Requirement 2.5: 初始数据管理

**User Story:** As a 管理员, I want 管理郡国和特产的初始数据, so that 重置系统可以正确恢复到初始状态。

#### Acceptance Criteria

1. THE System SHALL 在首次启动时自动保存当前郡国数据为初始数据备份
2. THE System SHALL 提供初始数据管理界面供管理员查看和修改初始值
3. THE 初始数据管理界面 SHALL 显示每个郡国的初始石高
4. THE 初始数据管理界面 SHALL 显示每个郡国的初始特产列表
5. WHEN 管理员修改初始数据, THE System SHALL 保存修改后的初始数据
6. THE System SHALL 将初始数据存储在独立的数据文件中（如 initial-territories.json）
7. WHEN 执行重置操作, THE Reset_System SHALL 使用初始数据文件恢复郡国数据

### Requirement 3: 投资确认机制

**User Story:** As a 玩家, I want 在投资前确认操作并查看详细结果, so that 我可以避免误操作并了解投资效果。

#### Acceptance Criteria

1. WHEN 玩家点击任意投资按钮, THE Investment_Panel SHALL 显示确认对话框询问是否确认投资
2. THE 确认对话框 SHALL 显示投资类型、花费、成功率等关键信息
3. WHEN 玩家确认投资后, THE Investment_Panel SHALL 显示结果对话框
4. THE 结果对话框 SHALL 显示具体数值变化（如"成功，农业增长5点"）
5. WHEN 玩家点击结果对话框的确定按钮, THE System SHALL 更新并保存数据
6. THE 四种投资系统（农业、商业、水军、武备）SHALL 统一使用确认和结果对话框机制

### Requirement 4: 投资数值调整

**User Story:** As a 游戏设计者, I want 调整投资系统的单次投入金额, so that 游戏平衡性更好。

#### Acceptance Criteria

1. THE Agriculture_Investment SHALL 设定单次投入为7000石
2. THE Navy_Investment SHALL 设定单次投入为9000石
3. THE Armament_Investment SHALL 设定单次投入为6000石

### Requirement 5: 回溯系统实现

**User Story:** As a 管理员, I want 将游戏数据回溯到指定操作后的状态, so that 我可以撤销错误操作。

#### Acceptance Criteria

1. THE Rollback_System SHALL 显示可回溯的操作记录列表
2. WHEN 管理员选择一条操作记录, THE Rollback_System SHALL 显示该操作的详细信息
3. WHEN 管理员确认回溯, THE Rollback_System SHALL 将所有数据恢复到该操作完成后的状态
4. WHEN 回溯完成, THE Rollback_System SHALL 删除该操作之后的所有操作记录和快照
5. THE Rollback_System SHALL 在回溯前要求管理员二次确认

### Requirement 6: 重置系统实现

**User Story:** As a 管理员, I want 重置游戏到初始状态, so that 我可以开始新的游戏本。

#### Acceptance Criteria

1. THE Reset_System SHALL 提供重置按钮供管理员使用
2. WHEN 管理员点击重置按钮, THE Reset_System SHALL 要求手动输入确认文本（如"确认重置"）
3. WHEN 确认文本正确, THE Reset_System SHALL 执行以下重置操作：
   - 将所有郡国石高恢复为初始值
   - 将所有郡国特产列表恢复为初始状态
   - 将所有郡国所属势力设为无
   - 清空所有势力数据
   - 清空所有军团数据
   - 重置游戏进程（年份等）
   - 清空所有操作记录
4. THE Reset_System SHALL 从初始数据备份文件恢复郡国数据
5. WHEN 重置完成, THE Reset_System SHALL 显示重置成功提示

### Requirement 7: 年度石高自然增长

**User Story:** As a 游戏设计者, I want 领地石高按势力增长率自然增长, so that 游戏经济系统更真实。

#### Acceptance Criteria

1. WHEN 执行年度结算, THE System SHALL 根据势力的自然增长率更新其控制的所有领地石高
2. THE System SHALL 对每个领地分别计算石高增长（领地石高 × 势力增长率）
3. THE System SHALL 确保石高增长计算已在现有代码中正确实现

### Requirement 8: 管理员安全密钥

**User Story:** As a 管理员, I want 使用更安全的密钥登录, so that 管理员账户不易被破解。

#### Acceptance Criteria

1. THE System SHALL 支持自定义管理员代码
2. THE System SHALL 生成一个复杂的安全密钥作为备用登录凭证
3. THE 安全密钥 SHALL 包含大小写字母、数字和特殊字符，长度至少32位
4. WHEN 用户输入管理员代码或安全密钥, THE System SHALL 允许进入管理员界面
5. THE System SHALL 提供管理员代码修改功能
6. THE System SHALL 在管理员界面显示当前安全密钥（可复制）
