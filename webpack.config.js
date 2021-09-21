const path = require('path')

module.exports = {
    entry: './src/Application.ts',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: [
                    path.resolve(__dirname, 'scripts'),
                    path.resolve(__dirname, 'dist'),
                    path.resolve(__dirname, 'temp'),
                    path.resolve(__dirname, 'assets')
                ]
            }
        ]
    },
    output: {
        filename: 'mooncord.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        modules: ['src', 'node_modules'],
        extensions: ['.tsx', '.ts', '.js', '.json']
    },
    externals: {
        'sharp': 'commonjs sharp',
        'websocket': 'commonjs websocket'
    },
    target: 'node'
};