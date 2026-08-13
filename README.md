# 数字藏品平台 运营管理后台

基于 Vue 3.3 + TypeScript + Element Plus + Pinia + Vite 的数字藏品平台运营管理后台。

## 技术栈

- 前端框架：Vue 3.3（`<script setup>` + 严格 TypeScript，禁止 `any`）
- UI 组件库：Element Plus 2.4+
- 状态管理：Pinia（admin / permission / app）
- 路由：Vue Router 4 动态路由（按登录角色动态注册菜单）
- 请求：Axios（统一 `Authorization: Bearer <token>`，403 自动跳登录）
- 图表：ECharts 5
- 日期：dayjs；金额：Decimal.js（字符串精度）
- PWA：vite-plugin-pwa

## 快速开始

```bash
# 安装依赖
npm install

# 开发环境（默认 Mock 模式）
npm run dev

# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 生产构建
npm run build
```

## 环境变量

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `VITE_APP_TITLE` | 应用标题 | 数字藏品管理后台 |
| `VITE_API_BASE_URL` | 接口基础地址（`/api` 前缀，开发环境由 Vite 代理转发到 `:3001`） | `/api` |
| `VITE_USE_MOCK` | 是否启用前端 Mock（`true` 走内置模拟后端，`false` 走真实接口） | `true`（dev）/ `false`（prod） |
| `VITE_SMS_CODE` | 演示短信验证码（数据清除流程校验） | `123456` |

配置文件：`.env.development`、`.env.production`。

## 接口地址 BaseURL

- 开发环境：`/api`，由 `vite.config.ts` 的 `server.proxy` 转发到 `http://localhost:3001`（后端服务需自行启动）。
- 生产环境：`/api`，由部署网关统一反代。
- Mock 模式：Axios `adapter` 拦截 `/api/**` 请求，由 `src/api/mock/index.ts` 中的内存数据库（`src/api/mock/db.ts`）模拟完整后端业务闭环，无需真实后端即可联调。

## 演示账号

| 角色 | 用户名 | 密码 | 权限范围 |
| --- | --- | --- | --- |
| 超级管理员 | `admin` | `admin123` | 全部功能 |
| 运营 | `operator` | `operator123` | 用户/藏品/订单/市场/转赠/营销/内容 |
| 财务 | `finance` | `finance123` | 订单/钱包/财务报表 |
| 风控 | `risk` | `risk123` | 用户/实名/黑名单/审批/告警/审计 |
| 客服 | `service` | `service123` | 用户查询/工单 |

演示短信验证码（数据清除、二次校验场景）：`123456`。

## 角色权限矩阵

| 模块 / 功能 | 超级管理员 | 运营 | 财务 | 风控 | 客服 |
| --- | :---: | :---: | :---: | :---: | :---: |
| 数据大盘 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 用户管理（列表/详情/冻结/重置/强制下线） | ✓ | ✓ | – | ✓(查询) | ✓(查询) |
| 实名认证（查看/完整实名查看） | ✓ | – | – | ✓ | – |
| 藏品管理（发行/发售/配额/空投/销毁） | ✓ | ✓ | – | – | – |
| 订单管理 | ✓ | ✓ | ✓ | – | – |
| 市场寄售（挂售/成交/手续费） | ✓ | ✓ | – | – | – |
| 转赠管理（记录/开关/撤销） | ✓ | ✓ | – | – | – |
| 营销活动（优先购/签到/邀请/抽奖/盲盒/合成/空投/注册福利） | ✓ | ✓ | – | – | – |
| 钱包财务（充值/流水/手续费/对账） | ✓ | – | ✓ | – | – |
| 内容管理（Banner/公告/帮助/藏品文案） | ✓ | ✓ | – | – | – |
| 系统配置（基础/支付/第三方/协议） | ✓ | – | – | – | – |
| 权限审计（管理员/角色/审计日志） | ✓ | – | – | ✓(日志) | – |
| 风控安全（黑名单/审批/告警） | ✓ | – | – | ✓ | – |
| 客服工单 | ✓ | – | – | – | ✓ |
| 数据报表 | ✓ | – | ✓(财务) | – | – |
| 平台运维（数据清除） | ✓ | – | – | – | – |

## 核心业务闭环（Mock 模拟后端）

- **库存池公式**：`stock_pool = total_supply - configured_quota - sold_sale - airdropped - destroyed`
  - 发售数量、配额预留、独立空投、销毁均受库存池限制，超出时提示「库存池不足，当前库存池为 X」。
  - 已使用的配额不可减少；删除配额仅释放未使用部分。
  - 强制售罄不清除发售剩余（剩余仍在库存池，用于后续补货或转化）。
- **资格购**：仅作为购买门槛（持有资格藏品 + 白名单手机号可购），不冻结配额；优先购资格可覆盖资格购门槛。
- **转赠/寄售开关**：互相独立，关闭寄售时自动批量下架在售挂单。
- **抽奖/盲盒概率**：奖品概率 0.0001~100（小数点后 4 位），非空奖概率总和必须 ≤100%，超出拦截；未配置空奖时若概率和不足 100% 也拦截提示。
- **高危操作**：统一「确认 + 原因 + 管理员密码」，校验失败拒绝，成功后写入审计日志。
- **数据清除**：四步确认（输入「确认清除」→ 管理员密码 → 短信验证码 → 二次确认），执行前自动生成备份编号。
- **完整实名查看**：需二次密码验证，写入审计日志。

## 目录结构

```
src/
├── api/            # 接口层（含 mock 后端：db.ts 内存数据 + index.ts 业务逻辑）
├── assets/         # 样式（variables.scss 设计变量 / index.scss 全局样式）
├── components/     # 通用组件（StatCard / RiskConfirm / MaskText / EChart / RewardConfigPanel）
├── directives/     # v-permission 权限指令
├── layouts/        # 主布局（Sidebar / Header / TabsBar）
├── router/         # 动态路由（views.ts 视图注册表）
├── store/          # Pinia（admin / permission / app）
├── types/          # 全局类型
├── utils/          # 工具（request / token / date / amount / mask / validate）
└── views/          # 页面（user / collectible / order / market / transfer / marketing /
                    #        wallet / cms / system / permission / security / ticket / report / platform）
```

## 切换真实后端

1. 将 `.env.development` / `.env.production` 中 `VITE_USE_MOCK` 设为 `false`。
2. 确保后端服务按 `src/api/**/*.ts` 中的接口契约实现（`{ code, data, message }` 统一返回结构，`/api` 前缀）。
3. 接口已按业务模块拆分，替换 Mock 无需改动任何页面代码。
