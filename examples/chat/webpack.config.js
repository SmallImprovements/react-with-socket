'use strict';

var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: [
    './index.js'
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'react-hot-loader!babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        include: path.resolve(__dirname, 'src')
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.css'],
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  output: {
    path: __dirname + '/public',
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'index.html' }
    ]),
    new webpack.ProvidePlugin({
      React: 'react'
    }),
    new webpack.DefinePlugin({
      PRODUCTION: process.env.NODE_ENV === 'production'
    })
  ],
  devServer: {
    contentBase: './public',
    historyApiFallback: {
      disableDotRule: true
    },
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        secure: false
      }
    }
  }
};

