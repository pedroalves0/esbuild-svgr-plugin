import path from 'path'
import { build, OutputFile } from 'esbuild'
import { svgrPlugin } from '.'

describe('SVGR Plugin', () => {
    function getOutputFilesContent(outputFiles: OutputFile[]): {
        [Type in 'js' | 'css' | 'svg']?: { filename: string; content: string }
    } {
        return outputFiles?.reduce((outputFilesContent, { path: pathname, text }) => {
            const fileType = path.extname(pathname)

            if (fileType === '.js' || fileType === '.css' || fileType === '.svg') {
                return {
                    ...outputFilesContent,
                    [fileType.substring(1)]: {
                        filename: path.basename(pathname),
                        content: text,
                    },
                }
            }

            return outputFilesContent
        }, {})
    }

    function runBuild({ entrypoint = 'example/app.tsx', plugins = [svgrPlugin()] } = {}) {
        return build({
            plugins,
            entryPoints: [entrypoint],
            bundle: true,
            sourcemap: false,
            format: 'esm',
            loader: {
                '.svg': 'file',
            },
            outfile: path.resolve(__dirname, 'build', 'app.js'),
            write: false,
        })
    }

    test('converts svg in .tsx file', async () => {
        const result = await runBuild()

        expect(result.outputFiles).toHaveLength(3)

        const outputFilesContent = getOutputFilesContent(result.outputFiles)
        expect(outputFilesContent.svg?.filename).toMatch(/esbuild-.*\.svg/)
        expect(outputFilesContent.css?.content).toContain(
            `background-image: url(./${outputFilesContent.svg?.filename})`,
        )
        expect(outputFilesContent.js?.content).toContain('var esbuild_default = SvgEsbuild')
    })

    test('supports custom issuer matcher', async () => {
        const result = await runBuild({
            plugins: [svgrPlugin({ issuer: /\.jsx?$/ })],
        })

        expect(result.outputFiles).toHaveLength(3)

        const outputFilesContent = getOutputFilesContent(result.outputFiles)
        expect(outputFilesContent.svg?.filename).toMatch(/esbuild-.*\.svg/)
        expect(outputFilesContent.css?.content).toContain(
            `background-image: url(./${outputFilesContent.svg?.filename})`,
        )

        // the entrypoint .tsx filetype is not part of the issuer matcher regex,
        // thus the svg is not converted to a React component and the
        // fallback .svg loader is used instead.
        expect(outputFilesContent.js?.content).not.toContain('var esbuild_default = SvgEsbuild')
        expect(outputFilesContent.js?.content).toContain(
            `var esbuild_default = "./${outputFilesContent.svg?.filename}";`,
        )
    })

    test('supports custom svg filetypes', async () => {
        const result = await runBuild({
            entrypoint: 'example/app-xml.tsx',
            plugins: [svgrPlugin({ filter: /\.xml$/, issuer: /\.tsx?$/ })],
        })

        expect(result.outputFiles).toHaveLength(1)

        const outputFilesContent = getOutputFilesContent(result.outputFiles)
        expect(outputFilesContent.svg).toBeUndefined()
        expect(outputFilesContent.css).toBeUndefined()
        expect(outputFilesContent.js?.content).toContain('var esbuild_default = SvgEsbuild')
    })
})
