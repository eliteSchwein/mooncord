import * as esbuild from 'esbuild'

const args = process.argv.slice(2)

const config = {
    entryPoints: ['src/Application.ts'],
    target: 'node22',
    treeShaking: true,
    color: true,
    platform: 'node',
    external: [
        'discord.js',
        '@resvg/resvg-js',
        'sharp',
    ],
    define: {
        'process.env.FLUENTFFMPEG_COV': 'false',
    },
    bundle: true,
    outfile: 'dist/index.js',
    minify: true,
}

if(args.includes('dev')) {
    config.minify = false
}

void build()

async function build() {
    await esbuild.build(config)
}