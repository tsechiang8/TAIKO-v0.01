# Requirements Document

## Introduction

下克上小助手是一个辅助文字游戏推演与游玩的Web系统，旨在减少繁杂的数据计算。系统支持管理员（上帝模式）和玩家（势力模式）两种角色，提供势力管理、军团操作、投资系统、游戏进程控制等核心功能。

## Glossary

- **势力 (Faction)**: 游戏中的一个独立政治实体，由玩家控制
- **郡国 (Territory)**: 游戏地图上的基本行政单位，包含石高、城池、特产等属性
- **军团 (Legion)**: 由将领指挥的军事单位，包含士兵和装备
- **石高 (Kokudaka)**: 衡量领地产出的基本单位，决定收入和士兵上限
- **表面石高 (Surface_Kokudaka)**: 经过加成计算后的总石高
- **领地石高 (Territory_Kokudaka)**: 所有领地基础石高之和
- **特产石高 (Special_Product_Kokudaka)**: 由特产带来的固定石高产出
- **产业石高 (Industry_Kokudaka)**: 家族产业和商业开发获得的石高
- **领内财产 (Integration_Bonus)**: 完全占领令制国后的固定奖励
- **加成系数 (Bonus_Coefficient)**: 受税率和士兵维持比影响的系数
- **士兵维持比 (Soldier_Maintenance_Ratio)**: 当前士兵总数与可招募上限的比值
- **上级武士 (Senior_Samurai)**: 可担任军团将领或执行任务的武士
- **投资系统 (Investment_System)**: 包含农业、商业、水军、武备四大子系统
- **回溯系统 (Rollback_System)**: 记录操作历史并支持数据回滚的功能

## Requirements

### Requirement 1: 登录与权限系统

**User Story:** As a 用户, I want to 通过代码登录系统, so that I can 根据权限访问相应功能。

#### Acceptance Criteria

1. WHEN 系统启动 THEN THE Login_Interface SHALL 显示代码输入框和确认按钮
2. WHEN 用户输入管理员代码（默认admin） THEN THE System SHALL 授予上帝模式权限
3. WHEN 用户输入势力专属代码 THEN THE System SHALL 授予该势力的玩家权限
4. WHEN 用户输入无效代码 THEN THE System SHALL 显示错误提示并阻止登录
5. WHILE 用户处于管理员权限 THEN THE System SHALL 允许查看、编辑、新增、删除所有数据
6. WHILE 用户处于玩家权限 THEN THE System SHALL 仅允许查看和操作该势力所属数据

### Requirement 2: 玩家仪表盘

**User Story:** As a 玩家, I want to 查看势力基础信息, so that I can 了解当前势力状态。

#### Acceptance Criteria

1. THE Dashboard SHALL 显示势力名称、家主姓名
2. THE Dashboard SHALL 显示收入（计算公式：表面石高 × 税率 × 0.4）
3. THE Dashboard SHALL 显示表面石高（领地石高 × (1 + 加成系数) + 特产石高 + 领内财产 + 产业石高）
4. THE Dashboard SHALL 显示陆军等级（对应武备等级）
5. THE Dashboard SHALL 显示武库数据（铁炮、战马、大筒数量）
6. THE Dashboard SHALL 显示总兵力（库存闲置士兵 + 所有军团在编士兵）
7. THE Dashboard SHALL 显示闲置士兵数量
8. THE Dashboard SHALL 显示可招募士兵上限
9. THE Dashboard SHALL 显示最多10个增益名称及效果

### Requirement 3: 详细信息列表模块

**User Story:** As a 玩家, I want to 查看领地、武士、外交、军团详细列表, so that I can 管理势力资源。

#### Acceptance Criteria

1. THE Territory_List SHALL 显示郡名、令制国、领地石高、城池名称、城池等级、特产1-3、驻扎军团
2. THE Samurai_List SHALL 显示姓名、类型、武功、文治、状态、行动力
3. THE Diplomacy_List SHALL 显示目标势力名称和当前关系（仅显示已有关系的势力）
4. THE Legion_List SHALL 显示军团名称、将领、人数、铁炮、战马、大筒、位置
5. WHEN 列表数据超过10条 THEN THE List_View SHALL 支持滚动查看且表头固定
6. WHEN 用户点击军团列表项 THEN THE System SHALL 展开军团管理菜单

### Requirement 4: 招募士兵

**User Story:** As a 玩家, I want to 招募士兵, so that I can 增加军事力量。

#### Acceptance Criteria

1. WHEN 用户点击招募士兵按钮 THEN THE System SHALL 弹出数量选择弹窗
2. THE Recruit_Dialog SHALL 使用滑动条和数字输入框组合
3. THE Recruit_Dialog SHALL 限制最大值为当前可招募士兵数值
4. WHEN 用户确认招募 THEN THE System SHALL 扣除可招募士兵额度并增加闲置士兵库存
5. THE Recruit_System SHALL 不消耗金钱

### Requirement 5: 建立军团

**User Story:** As a 玩家, I want to 建立军团, so that I can 组织军事力量。

#### Acceptance Criteria

1. WHEN 用户点击建立军团按钮 THEN THE System SHALL 弹出军团创建弹窗
2. THE Create_Legion_Dialog SHALL 包含军团名称输入（1-8个简体中文字符）
3. THE Create_Legion_Dialog SHALL 包含将领下拉选择（本势力所有上级武士）
4. THE Create_Legion_Dialog SHALL 包含军团人数滑条（扣除库存闲置士兵，必须>0）
5. THE Create_Legion_Dialog SHALL 包含军械配置滑条（铁炮、战马、大筒）
6. THE Create_Legion_Dialog SHALL 包含创建位置下拉（本势力拥有的领地）
7. WHEN 军团名称不符合规范 THEN THE System SHALL 显示红字提示并阻止提交
8. WHEN 必填项为空点击保存 THEN THE System SHALL 使输入框边框变红并闪烁
9. WHEN 选择的将领已是另一军团指挥官 THEN THE System SHALL 弹出警告并要求处理原军团
10. THE System SHALL 确保一个将领绝对不能同时担任两个军团的指挥官

### Requirement 6: 军团管理

**User Story:** As a 玩家, I want to 管理已有军团, so that I can 调整军事部署。

#### Acceptance Criteria

1. WHEN 用户点击解散军团 THEN THE System SHALL 弹出确认警告
2. WHEN 用户确认解散 THEN THE System SHALL 删除军团并将资源返还库存
3. WHEN 用户点击编辑人数 THEN THE System SHALL 弹出滑条弹窗（最大值=当前人数+库存剩余）
4. WHEN 人数调整为0 THEN THE System SHALL 询问是否解散军团
5. WHEN 用户点击编辑装备 THEN THE System SHALL 弹出装备调整弹窗
6. THE Legion_Management SHALL 实时更新军团和库存数据

### Requirement 7: 投资系统

**User Story:** As a 玩家, I want to 进行投资操作, so that I can 发展势力各项能力。

#### Acceptance Criteria

1. THE Investment_Interface SHALL 显示势力库存和四项当前点数
2. THE Investment_Interface SHALL 允许选择投资项目（农业、商业、水军、武备）
3. THE Investment_Interface SHALL 显示预计成功率和成功时的预计效果
4. WHEN 用户点击投资 THEN THE System SHALL 弹出确认对话框
5. WHEN 用户确认投资 THEN THE System SHALL 根据判定核心引擎计算结果
6. THE Investment_System SHALL 使用D100随机判定（大成功<5，成功<成功率，失败>成功率）
7. THE Investment_System SHALL 扣除执行武士一点行动力
8. WHEN 武士行动力为0 THEN THE System SHALL 阻止指派该武士

### Requirement 8: 管理员数据管理

**User Story:** As a 管理员, I want to 管理游戏数据, so that I can 维护游戏运行。

#### Acceptance Criteria

1. THE Admin_Panel SHALL 提供郡国数据管理表格（支持搜索、筛选、编辑、新增）
2. THE Admin_Panel SHALL 提供势力代码管理表（势力名称、家主、登录代码）
3. THE Admin_Panel SHALL 提供全军团一览表（所属势力、军团名、将领、人数、军械、位置）
4. THE Admin_Panel SHALL 提供特产系统配置页面（新增、修改、删除特产）
5. WHEN 管理员修改数据 THEN THE System SHALL 实时映射到玩家端

### Requirement 9: 游戏进程控制

**User Story:** As a 管理员, I want to 控制游戏进程, so that I can 推进游戏发展。

#### Acceptance Criteria

1. WHEN 管理员点击下一年按钮 THEN THE System SHALL 弹出确认提醒
2. WHEN 管理员确认下一年 THEN THE System SHALL 执行后台结算并刷新页面
3. WHEN 管理员点击锁定按钮 THEN THE System SHALL 锁定所有玩家操作
4. WHEN 管理员点击下一年 THEN THE System SHALL 解除锁定
5. THE Admin_Panel SHALL 提供记账与推演页面（年份、势力、内容、是否计算）
6. THE Admin_Panel SHALL 提供操作记录与回溯系统（保留最近100条）
7. WHEN 管理员点击跳转至此 THEN THE System SHALL 将数据回溯到该记录完成时的状态

### Requirement 10: 数据导入功能

**User Story:** As a 管理员, I want to 批量导入数据, so that I can 快速初始化游戏数据。

#### Acceptance Criteria

1. WHEN 管理员点击导入 THEN THE System SHALL 显示类型选择（郡国/军团/势力）
2. WHEN 管理员选择类型 THEN THE System SHALL 跳转至纯文本表格界面
3. THE Import_Interface SHALL 仅显示表头
4. WHEN 管理员粘贴Excel内容并确认 THEN THE System SHALL 自动解析并覆盖保存

### Requirement 11: 核心计算逻辑

**User Story:** As a 系统, I want to 正确计算各项数值, so that 游戏数据准确无误。

#### Acceptance Criteria

1. THE Calculator SHALL 计算表面石高 = 领地石高 × (1 + 加成系数) + 特产石高 + 领内财产 + 产业石高
2. THE Calculator SHALL 计算收入 = 表面石高 × 税率 × 0.4
3. THE Calculator SHALL 根据税率计算士兵上限（40%:×230, 60%:×200, 80%:×180）
4. THE Calculator SHALL 根据士兵维持比计算加成系数和自然增长率
5. THE Calculator SHALL 在下一年结算时扣除维护费（步卒4石、战马12石、铁炮3石、大筒450石）
6. THE Calculator SHALL 对军团编制士兵额外加收4石/人/年
7. THE Calculator SHALL 扣除武士俸禄（2000石/人/年）

### Requirement 12: UI交互规范

**User Story:** As a 用户, I want to 获得一致的交互体验, so that 操作直观易用。

#### Acceptance Criteria

1. THE System SHALL 全站使用简体中文字符编码
2. THE List_View SHALL 一次性最多显示10条数据
3. WHEN 数据超过10条 THEN THE List_View SHALL 支持滚轮滚动且表头固定
4. THE List_View SHALL 确保滚动数据行与固定表头严格对齐
5. THE Number_Input SHALL 采用滑动条和数字输入框组合
6. THE Number_Input SHALL 实现滑条与数字框双向联动
7. WHEN 输入小于0 THEN THE Number_Input SHALL 自动变为0
8. WHEN 输入大于最大值 THEN THE Number_Input SHALL 自动变为最大值

### Requirement 13: 网络与分享功能

**User Story:** As a 用户, I want to 分享游戏链接, so that 其他人可以访问游戏。

#### Acceptance Criteria

1. THE System SHALL 支持联网访问
2. THE System SHALL 生成可分享的URL链接
3. WHEN 他人点击分享链接 THEN THE System SHALL 正常打开并可使用

### Requirement 14: 错误报告系统

**User Story:** As a 玩家, I want to 报告遇到的问题, so that 管理员可以及时处理错误。

#### Acceptance Criteria

1. THE Player_Interface SHALL 显示报错按钮
2. WHEN 玩家点击报错按钮 THEN THE System SHALL 保存玩家最近五步操作记录
3. WHEN 玩家点击报错按钮 THEN THE System SHALL 将操作记录发送到管理员错误报告界面
4. WHEN 系统运行出错 THEN THE System SHALL 自动弹出错误提示弹窗
5. WHEN 系统运行出错 THEN THE System SHALL 自动将玩家最近五步操作记录发送到管理员错误报告界面
6. THE Admin_Panel SHALL 提供独立的错误报告查看界面
7. THE Error_Report SHALL 包含玩家信息、错误时间、错误描述、最近五步操作记录
8. THE Admin_Error_Panel SHALL 支持按时间、玩家筛选错误报告
9. THE Admin_Error_Panel SHALL 支持标记错误为已处理
