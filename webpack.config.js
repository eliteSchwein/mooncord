const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './mooncord.js',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
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
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        modules: ['src', 'node_modules'],
        extensions: ['.tsx', '.ts', '.js', '.json']
    },
    externals: {
        'sharp': 'commonjs sharp'
    },
    target: 'node'
};