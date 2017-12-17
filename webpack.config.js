'use strict';

const fs = require('fs');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const pkg = require('./package');

const isProduction = process.env.NODE_ENV === 'production';

class WebpackAfterAllPlugin {
  apply(compiler) {
    compiler.plugin('done', (compilation) => {
      setTimeout(() => {
        fs.writeFileSync(path.join(__dirname, '.ready'), '')
      }, 1000)
    })
  }
}

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
    loaders: [
      {
        test: /\.js[x]?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react', 'env', 'latest'],
            plugins: [
              [
                'import',
                {
                  libraryName: 'antd',
                  style: 'css'
                }
              ]
            ]
          }
        }
      }, isProduction ? {} : {
        test: /\.js[x]?$/,
        enforce: 'post',
        exclude: /node_modules/,
        loader: 'istanbul-instrumenter-loader',
        query: {
          esModules: true,
          coverageVariable: '__macaca_coverage__'
        }
      }, {
        test: /\.json$/,
        loader: 'json-loader',
        exclude: /node_modules/
      }, {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!less-loader'
        })
      }, {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin(`${pkg.name}.css`),
    new WebpackAfterAllPlugin()
  ]
};
