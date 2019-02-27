const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  devtool: process.env.NODE_ENV === 'develop' ? 'inline-source-map' : 'source-map',
  target: 'node',
  entry: {
    index: './scaffold.ts',
    test: './test.ts',
    cmd: './cmd.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    library: 'library',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts']
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: [/\.tsx?$/],
        loader: 'ts-loader',
        exclude: [/\/examples\//, /\/node_modules\//]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      '__dirname': '__dirname'
    }),
    new webpack.BannerPlugin({
      banner: '#!/usr/bin/env node',
      raw: true,
      include: [/cmd\.js/],
    }),
    new CopyPlugin(['index.d.ts']),
  ],
}
