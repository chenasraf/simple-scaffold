const path = require('path')

module.exports = {
  target: 'node',
  entry: './scaffold.ts',
  output: {
    filename: 'scaffold.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: ['./examples', './utils']
      }
    ]
  }
}
