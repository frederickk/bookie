const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const compress = require('compression');

const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const SassLintPlugin = require('sass-lint-webpack');
const autoprefixer = require("autoprefixer");

const config = {
  mode: 'development',

  devtool: 'inline-source-map',

  entry: {
    background: [
      path.join(__dirname, './src/background.js'),
    ],
    index: [
      path.join(__dirname, './src/index.js'),
      path.join(__dirname, './src/index.scss'),
    ],
    notes: [
      path.join(__dirname, './src/js/notes.js'),
    ],
  },

  resolve: {
    modules: [
      path.resolve(__dirname, './src/js'),
      path.resolve(__dirname, './src/sass'),
      path.resolve(__dirname, 'node_modules'),
    ]
  },

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "eslint-loader",
    }, {
      test: /\.s?css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: [
              require('autoprefixer')(),
            ]
          }
        }, {
          loader: 'sass-loader',
          options: {
            includePaths: [path.resolve(__dirname, 'node_modules')],
          },
        },
      ]
    }, {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader?limit=100000'
    }],
  },

  output: {
    path: path.join(__dirname, './src'),
    publicPath: './src',
    filename: './[name].min.js',
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [
          autoprefixer()
        ]
      }
    }),
    new SassLintPlugin({
      files: './src/*.scss'
    }),
    new MiniCssExtractPlugin({
      filename: 'index.min.css'
    }),
  ],
};


module.exports = config;
