// const CopyPlugin = require('copy-webpack-plugin');
const {ESBuildMinifyPlugin} = require('esbuild-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const nunjucks = require('nunjucks');
const NunjucksWebpackPlugin = require('nunjucks-webpack-plugin');
const path = require('path');
const slugify = require('slugify');
const webpack = require('webpack');

const sassLoaderOptions = {
  loader: 'sass-loader',
  options: {
    implementation: require('sass'),
    sassOptions: {
      quietDeps: true,
    },
    // webpackImporter: false,
  },
};

const env = (process.env.NODE_ENV === 'production')
    ? 'production'
    : 'development';
const pageIndices = ['intro', 'notes', 'popup'];

const nunjucksEnv = nunjucks.configure('./', {
  watch: true,
});
nunjucksEnv.addFilter('slug', str => {
  return slugify(str).substring(0, 16).toLowerCase();
});

const generateNjk = (arr) => {
  const out = [];
  arr.forEach(index => {
    out.push({
      from: `./src/${index}.njk`,
      to: `./${index}.html`,
      context: {
        data: {/** JSON Object */},
      },
    });
  });

  return out;
};

module.exports = {
  mode: env,
  entry: {
    background: [
      path.join(__dirname, './src/background'),
    ],
    popup: [
      path.join(__dirname, './src/popup'),
      path.join(__dirname, './src/popup.scss'),
    ],
    notes: [
      path.join(__dirname, './src/notes'),
      path.join(__dirname, './src/notes.scss'),
    ],
  },
  devServer: {
    compress: true,
    contentBase: './src',
    watchContentBase: true,
  },
  watchOptions: {
    poll: true,
    ignored: /node_modules/,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{
      test: /\.(ts|tsx)?$/i,
      loader: 'esbuild-loader',
      options: {
        loader: 'ts',
        target: 'es2015'
      }
    }, {
      test: /\.(sa|sc|c)ss$/i,
      use: [
        'lit-element-scss-loader',
        'extract-loader',
        'css-loader',
        sassLoaderOptions,
      ],
      include: [
        path.resolve(__dirname, 'src/components'),
        path.resolve(__dirname, 'node_modules'),
      ],
    }, {
      test: /\.(sa|sc|c)ss$/i,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        sassLoaderOptions,
      ],
      exclude: [
        path.resolve(__dirname, 'src/components')
      ],
    }, {
      test: /\.(png|jpg|jpe?g|gif)$/i,
      type: 'asset/resource',
    }, {
      test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
      type: 'asset/inline',
    }],
  },
  plugins: [
    // new CopyPlugin({
    //   patterns: [{
    //     from: './src/images',
    //     to: '../build/images',
    //   }],
    // }),
    new NunjucksWebpackPlugin({
      templates: [...generateNjk(pageIndices)],
      configure: nunjucksEnv,
    }),
    new MiniCssExtractPlugin({
      filename: './[name].min.css',
    }),
    {
      apply: (compiler) => {
        if (env === 'production') {
          compiler.hooks.done.tap('DonePlugin', (stats) => {
            setTimeout(() => {
              process.exit(0);
            });
          });
        } else {
          return;
        }
      }
    }
  ],
  optimization: {
    minimize: true,
    minimizer: [new ESBuildMinifyPlugin({
      target: 'es2015',
      css: true
    })],
  },
  output: {
    path: path.join(__dirname, 'src/'),
    publicPath: '',
    filename: '[name].min.js',
    assetModuleFilename: 'images/[name][ext]',
  },
};



