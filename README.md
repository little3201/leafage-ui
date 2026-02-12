# Leafage UI

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE) [![github stars](https://img.shields.io/github/stars/little3201/leafage-ui)](https://github.com/little3201/leafage-ui/stargazers) [![github forks](https://img.shields.io/github/forks/little3201/leafage-ui)](https://github.com/little3201/leafage-ui/network/members)

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=little3201_leafage-ui&metric=bugs)](https://sonarcloud.io/summary/new_code?id=little3201_leafage-ui)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=little3201_leafage-ui&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=little3201_leafage-ui)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=little3201_leafage-ui&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=little3201_leafage-ui)

</div>

<p align="center">
  免费且美观的管理模板，使用 Vue 3、Vite、Pinia 和 Tailwind CSS构建。设计用于构建高效、响应式和快速加载的管理界面。
  
  后台接口服务仓库： <a href="https://github.com/little3201/leafage.git">后端服务仓库</a> </br>
</p>

|   分支   | 认证模式|                 组件库                      |              预览地址       |
|----------|--------|--------------------------------------------|-----------------------------|
| element  |  BFF   | [Element plus](https://element-plus.org)   | https://preivew.leafage.top |
| develop  |  PKCE  | [Quasar framework](https://quasar.dev)     | https://console.leafage.top |
| react    |  JWT   | [Material UI](https://mui.com/material-ui) |              -              |

### 特性

- **Vue 3、Vite、Pinia 和 Tailwind CSS -** 快速高效的开发
- **可访问性 -** 包容且用户友好
- **i18n集成 -** 便于国际化
- **高度可定制 -** 可根据项目风格定制

## 技术栈

开发框架：Vue3/React、TypeScript、Vite、Element-Plus/Quasar、Tailwind CSS

代码规范：Eslint、Prettier、Stylelint、Husky、Lint-staged、cz-git

## 页面预览

**light模式**
<img src="https://cdn.leafage.top/preview-light-element.jpeg" alt="light" />

**dark模式**
<img src="https://cdn.leafage.top/preview-dark-element.jpeg" alt="dark" />

### 目录结构

```
├── public/                 # Public static assets
│   ├── icons/              # Public icons
│   └── svgs/               # Public svgs
├── src/
│   ├── api/                # http request api
│   ├── assets/             # assets
│   ├── boot/               # plugins init
│   ├── components/         # Vue components
│   ├── constants/          # Constants
│   ├── css/                # css
│   ├── lang/               # i18n languages
│   ├── layouts/            # Layout components
│   ├── mocks/              # Mocks with msw
│   ├── pages/              # Pages
│   ├── router/             # vue router
│   ├── stores/             # Pinia
│   ├── utils/              # Utils
│   ├── App.vue             # Root component
│   ├── env.d.ts            # Env.d
│   ├── main.ts             # main
│   └── types.d.ts          # Types.d
├── test/                   # Test with vitest
│   └── utils.test.ts       # utils test
├── index.html              # Entry HTML file
├── .env.development        # Env for dev
├── .env.production         # Env for prod
├── postcss.config.js       # Postcss configuration
├── eslint.config.js        # Eslint configuration
├── commitlint.config.js    # Commitlint configuration
├── lint-staged.config.js   # Lint staged configuration
├── vite.config.ts          # Vite configuration
└── vitest.config.ts        # Vitest configuration
```
