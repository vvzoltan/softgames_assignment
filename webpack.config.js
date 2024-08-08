const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const PACKAGE = require('./package.json');
const webpack = require('webpack');


// Library output details
const FILE_NAME = "game";
const LIBRARY_NAME = PACKAGE.name;

// Build, source, etc paths
const PATHS = {
    entryPoint: path.resolve(__dirname, 'src/index.ts'),
    dist: path.resolve(__dirname, 'public/libs')
};

// Webpack config
module.exports = {
    mode: "production",
    entry: {
        [FILE_NAME]: [PATHS.entryPoint],
        [FILE_NAME + '.min']: [PATHS.entryPoint]
    },
    output: {
        path: PATHS.dist,
        filename: '[name].js',
        libraryTarget: 'umd',
        library: LIBRARY_NAME,
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            include: /\.min\.js$/
        })]
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: ["/node_modules/"]
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({
            PIXI: 'pixi.js'
        }),
        new CopyPlugin({
            patterns: [
                { from: "node_modules/pixi.js/dist/pixi.min.js", to: PATHS.dist }
            ]
        })
    ],
    externals: [
        {"pixi.js": "PIXI"},
    ]
}