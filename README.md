# Leafage UI

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE) [![github stars](https://img.shields.io/github/stars/little3201/leafage-ui)](https://github.com/little3201/leafage-ui/stargazers) [![github forks](https://img.shields.io/github/forks/little3201/leafage-ui)](https://github.com/little3201/leafage-ui/network/members)

</div>

<p align="center">
  管理模板，使用 Vue 3/React、Vite、Pinia 和 Tailwind CSS构建。设计用于构建高效、响应式和快速加载的管理界面。
  
  后台接口服务仓库： <a href="https://github.com/little3201/leafage.git">后端服务仓库</a> </br>

  基于 <a href="https://element-plus.org">Element plus</a> 库（branch: element）。</br>
  基于 <a href="https://quasar.dev">Quasar framework</a> 库（branch: main, develop）。</br>
  基于 <a href="https://mui.com">Material UI</a> 库（branch: react）。
</p>

### 特性

- **Vue 3/React、Vite、Pinia 和 Tailwind CSS -** 快速高效的开发
- **深色主题 -** 现代且引人注目
- **可访问性 -** 包容且用户友好
- **i18n集成 -** 便于全球本地化
- **响应式设计 -** 自适应各种大小的设备
- **高度可定制 -** 可根据项目风格定制

## 技术栈

开发框架：Vue3/React、TypeScript、Vite、Element-Plus/Quasar、Tailwind CSS
测试框架：Vitest
代码规范：Eslint、Husky、Lint-staged、commitlint

## 页面预览

**light模式**
<img src="https://cdn.leafage.top/preview-light.jpeg?e=1768291499&token=8dU5qN6888NJXQTTgWJVA_VR3MM1z6RlGPQdlsnX:OhEqoGXUhMj_-DbNvB_eOo9god0=" />

**dark模式**
<img src="https://cdn.leafage.top/preview-dark.jpeg?e=1768291533&token=8dU5qN6888NJXQTTgWJVA_VR3MM1z6RlGPQdlsnX:s9vaTrnVIbbH4YJbfu_yO6NJgNo=" />

### 目录结构

```
├── public/                 # Public static assets
│   ├── icons/              # Public icons
│   ├── svgs/               # Public svgs
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
│   └── App.vue             # Root component
├── test/                   # Test
├── index.html              # Entry HTML file
├── .env.development        # Env for dev
├── .env.production         # Env for prod
└── postcss.config.js       # Postcss configuration
└── eslint.config.js        # Eslint configuration
└── commitlint.config.js    # Commitlint configuration
└── lint-staged.config.js   # Lint staged configuration
└── quasar.config.ts        # Vite configuration
└── vitest.config.ts        # Vitest configuration
```