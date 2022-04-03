import fs from 'fs'
import path from 'path'
import { transform } from '@svgr/core'

import type { Plugin } from 'esbuild'

/**
 * An esbuild plugin that transforms SVG imports to imports of
 * React components that wrap the SVGs.
 * By default the plugin targets .svg files found
 * in .(ts,js,tsx,tsx) files.
 *
 * If the filter or issuer matcher doesn't match an asset,
 * the asset is resolved falling back to the rest of the plugin
 * chain up to the defined default loader.
 *
 * The SVG React component is a default export.
 *
 * @param filter A regular expression that indicates which assets
 *               should be converted to a React component
 * @param issuer A regular expression that controls on which
 *               files the imports should be transformed
 *
 * @returns
 */
export function svgrPlugin({ filter = /\.svg$/, issuer = /\.[jt]sx?$/ } = {}): Plugin {
    return {
        name: 'svgr-plugin',
        setup({ onResolve, onLoad }) {
            onResolve({ filter }, (args) => {
                return {
                    path: path.join(args.resolveDir, args.path),
                    namespace: issuer.test(args.importer) ? 'svgr' : undefined,
                }
            })

            onLoad({ filter: /.*/, namespace: 'svgr' }, async ({ path: pathname }) => {
                const [filename] = pathname.split('?', 2)
                const dirname = path.dirname(filename)
                const svg = await fs.promises.readFile(pathname, 'utf8')
                const contents = await transform(svg, undefined, { filePath: pathname })

                return {
                    contents,
                    loader: 'jsx',
                    resolveDir: dirname,
                }
            })
        },
    }
}

export default svgrPlugin
