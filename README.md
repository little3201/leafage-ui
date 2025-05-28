# element-plus-vite-starter

> A starter kit for Element Plus with Vite

- Preview: <https://preview.leafage.top>

This is an example of on-demand element-plus with [unplugin-vue-components](https://github.com/antfu/unplugin-vue-components).

> If you want to import all, it may be so simple that no examples are needed. Just follow [quickstart | Docs](https://element-plus.org/zh-CN/guide/quickstart.html) and import them.

If you just want an on-demand import example `manually`, you can check [unplugin-element-plus/examples/vite](https://github.com/element-plus/unplugin-element-plus/tree/main/examples/vite).

## Project setup
```bash
pnpm install
```

### Compiles and hot-reloads for development

```bash
pnpm run dev
```

### Compiles and minifies for production

```bash
pnpm run build
```

## Usage

```bash
git clone https://github.com/little3201/server-starter-ui
cd element-plus-vite-starter
pnpm i
pnpm run dev
```

### Custom theme

See `src/css/element/index.scss`.

### Project Structure

```
server-starter-ui/
├── src/
│   ├── api/         # http request api
│   ├── boot/        # Vue composables
│   ├── components/         # Vue components
│   ├── constants/         # Vue components
│   ├── i18n/            # i18n
│   ├── layouts/            # Layout components
│   ├── mocks/            # Mocks
│   ├── pages/            # Pages
│   ├── router/            # vue router
│   ├── stores/            # Pinia
│   ├── utils/            # Utils
│   └── App.vue            # Root component
├── public/                # Public static assets
├── index.html            # Entry HTML file
└── vite.config.js        # Vite configuration
```
