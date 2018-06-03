'use strict';

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const pkg = require('./package');

module.exports = {

  entry: {
    [pkg.name]: path.join(__dirname, 'assets', 'app')
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist',
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      }, {
        test: /\.json$/,
        type: 'javascript/auto',
        use: 'json-loader',
        exclude: /node_modules/,
      }, {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
      }, {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    })
  ]
};
