const { join } = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    content: join(__dirname, 'src/content.ts'),
    background: join(__dirname, 'src/background.ts'),
  },
  output: {
    path: join(__dirname, '../../dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        use: 'ts-loader',
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: join(__dirname, 'manifest.json'), to: join(__dirname, '../../dist'), force: true },
        { from: join(__dirname, 'icon.png'), to: join(__dirname, '../../dist'), force: true },
        { from: join(__dirname, 'src/style.css'), to: join(__dirname, '../../dist'), force: true },
      ],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
