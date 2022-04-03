# esbuild-svgr-plugin

Another esbuild plugin that uses SVGR to transform SVGs into React components.

Other implementations lacked support for falling back to the default SVG loader whenever SVGR is inadequate. This version only transforms imports on files that are known to support React components, keeping itself configurable if needed.

## Install

npm:

```sh
npm i -D esbuild-svgr-plugin
```

yarn:

```sh
yarn add -D esbuild-svgr-plugin
```

## Usage

```ts
import esbuild from 'esbuild'
import { svgrPlugin } from 'esbuild-svgr-plugin'

esbuild.build({
    entryPoints: ['src/app.tsx'],
    bundle: true,
    outdir: 'dist/',
    plugins: [svgrPlugin()],
})
```

SVG imports found by `esbuild-svgr-plugin` are transformed to React components.

```ts
// app.tsx

import ReactDOM from 'react-dom'
import AppIcon from './icons/app-icon.svg'

import './app.css'

ReactDOM.render(<AppIcon />, null)
```

`esbuild-svgr-plugin` parses the content of `./icons/app-icon.svg` and wraps it in a React component. The output can be visualized as follows:

```tsx
function AppIcon {
    return (
        <svg>
            {/** ... */}
        </svg>
    )
}

export default AppIcon
```

By default, `esbuild-svgr-plugin` only transforms on a set of filetypes (`.js, .ts, .tjx, .tsx`). Doing it for others can lead to unexpected file loader errors. For instance, if there's an `url-import` in the `.css` file imported by `app.tsx`, the React component output is meaningless for this import type, thus breaking it.

```css
/* app.css */

.app::before {
    background-image: url('./images/illustration.svg');
    /* ... */
}
```

As `.css` imports are not parsed by `esbuild-svgr-plugin`, they fallback to the rest of the `esbuild` plugin chain loaders, or if there's none, to the default file loader.

## Configuration

```ts
esbuild.build({
    entryPoints: ['src/app.tsx'],
    bundle: true,
    outdir: 'dist/',
    plugins: [
        svgrPlugin({
            /**
             * A regular expression that indicates which assets
             * should be converted to a React component
             */
            filter: /\.(svg|xml)$/,
            /**
             * A regular expression that controls on which
             * files the imports should be transformed
             */
            issuer: /\.js/,
        }),
    ],
})
```
