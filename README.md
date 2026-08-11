# Leafage UI

<div align="center">

基于 Vue 3、Vite、Element Plus 与 Tailwind CSS 的后台管理前端。

[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/little3201/leafage-ui)](https://github.com/little3201/leafage-ui/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/little3201/leafage-ui)](https://github.com/little3201/leafage-ui/network/members)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=little3201_leafage-ui&metric=bugs)](https://sonarcloud.io/summary/new_code?id=little3201_leafage-ui)

[在线预览](https://preview.leafage.top) · [后端项目](https://github.com/little3201/leafage.git) · [问题反馈](https://github.com/little3201/leafage-ui/issues)

</div>

![浅色模式预览](https://vslthblsdjamyfpiclmj.supabase.co/storage/v1/object/public/oss/preview-light-element.jpeg)

![深色模式预览](https://vslthblsdjamyfpiclmj.supabase.co/storage/v1/object/public/oss/preview-dark-element.jpeg)

## 特性

- Vue 3 + TypeScript + Vite 的现代化开发体验
- Element Plus 组件库与 Tailwind CSS 样式工具
- Pinia 状态管理、Vue Router 动态路由与权限菜单
- vue-i18n 国际化支持（默认简体中文）
- Axios 请求封装：`/api` 基础路径、重复请求取消与 401 登录跳转
- MSW 浏览器端 Mock，便于部署预览环境演示
- Vitest 单元测试，以及 Husky、lint-staged、Commitlint 提交校验

## 分支说明

| 分支      | 认证方式 | 组件库                                     | 预览地址                                           |
| --------- | -------- | ------------------------------------------ | -------------------------------------------------- |
| `element` | BFF      | [Element Plus](https://element-plus.org)   | [preview.leafage.top](https://preview.leafage.top) |
| `develop` | PKCE     | [Quasar](https://quasar.dev)               | [console.leafage.top](https://console.leafage.top) |
| `react`   | JWT      | [Material UI](https://mui.com/material-ui) | —                                                  |

## 快速开始

### 环境要求

- Node.js：建议使用与项目依赖兼容的当前 LTS 版本
- pnpm：`10.28.0`（见 `package.json` 的 `packageManager` 字段）

建议通过 Corepack 管理 pnpm：

```bash
corepack enable
corepack prepare pnpm@10.28.0 --activate
```

安装依赖并启动开发服务器：

```bash
pnpm install
pnpm dev
```

Vite 会在终端输出本地访问地址。开发环境默认将以 `/api` 开头的请求代理到 `VITE_BASE_URL` 指定的后端。

## 环境配置与后端联调

项目使用 Vite 环境变量，现有配置文件如下：

| 文件               | 用途     | 默认 `VITE_BASE_URL`    |
| ------------------ | -------- | ----------------------- |
| `.env.development` | 本地开发 | `http://127.0.0.1:8760` |
| `.env.production`  | 生产构建 | `https://leafage.top`   |

可按实际后端地址修改或新增 `.env.local`（该文件已被 Git 忽略）：

```dotenv
VITE_APP_TITLE=Leafage Manage Platform
VITE_APP_VERSION=0.1.0
VITE_BASE_URL=http://127.0.0.1:8760
```

开发服务器会把 `/api/users` 转发为 `${VITE_BASE_URL}/users`。未登录或接口返回 401 时，应用会跳转到 `VITE_BASE_URL` 指定的登录入口。

> 生产构建中会启用 MSW，并对未定义的请求直接放行。若需要完整业务数据，请部署并配置可访问的后端服务。

## 常用命令

| 命令              | 说明                                           |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | 启动开发服务器                                 |
| `pnpm build`      | 先执行 TypeScript 构建检查，再生成生产构建产物 |
| `pnpm preview`    | 本地预览生产构建                               |
| `pnpm typecheck`  | 执行 TypeScript 类型检查                       |
| `pnpm test`       | 启动 Vitest 测试                               |
| `pnpm lint:check` | 检查格式与代码规范，不修改文件                 |
| `pnpm lint`       | 自动格式化并尝试修复代码规范问题               |

## 项目结构

```text
.
├── public/                 # 静态资源与 MSW Service Worker
├── src/
│   ├── api/                # 后端接口定义
│   ├── assets/             # 应用资源
│   ├── boot/               # Axios、i18n、MSW 等启动配置
│   ├── components/         # 可复用 Vue 组件
│   ├── constants/          # 常量与接口路径
│   ├── lang/               # 国际化语言包
│   ├── layouts/            # 页面布局
│   ├── mocks/              # MSW Mock handlers 与演示数据
│   ├── pages/              # 页面模块
│   ├── router/             # 路由守卫与动态路由生成
│   ├── stores/             # Pinia 状态
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型
│   └── utils/              # 通用工具与测试
├── .husky/                 # Git hooks
├── vite.config.mts         # Vite、组件自动导入与 API 代理配置
└── vitest.config.ts        # Vitest 配置
```

## 开发约定

提交前 Git hooks 会依次运行 `lint-staged` 与测试。提交信息需遵循 Conventional Commits，例如：

```text
feat: add user import
fix: handle expired session
docs: improve setup guide
```

支持的提交类型包括：`build`、`chore`、`ci`、`docs`、`feat`、`fix`、`perf`、`refactor`、`revert`、`style`、`test`。

提交 Pull Request 前，建议执行：

```bash
pnpm lint:check
pnpm typecheck
pnpm test --run
pnpm build
```

## 许可证

本项目基于 [MIT License](./LICENSE) 发布。
