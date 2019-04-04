const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const TARGET = process.env.TARGET;
const ROOT_PATH = path.resolve(__dirname);
const nodeModulesDir = path.join(ROOT_PATH, 'node_modules');

// Common configuration settings
const common = {
  entry: path.resolve(ROOT_PATH, 'src/index.js'),
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['node_modules']
  },
  output: {
    path: path.resolve(ROOT_PATH, 'dist'),
    filename: 'lib.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: path.resolve(ROOT_PATH, 'src')
      },
      {
        test: /\.png.*$/,
        loaders: ['url-loader?limit=100000&mimetype=image/png'],
        exclude: /node_modules/
      }
    ]
  }
};

// Development configuration settings
if (TARGET === 'dev') {
  module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      publicPath: 'http://localhost:3000/',
      port: '3000',
      host: '0.0.0.0',
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,
      contentBase: 'dist'
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          loader: 'style-loader!css-loader!less-loader'
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development')
        },
        __DEV__: true
      })
    ]
  });
}

// Production configuration settings
if (TARGET === 'build' || TARGET === 'analyze') {
  let plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      },
      __DEV__: false
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "style.css",
      chunkFilename: "[id].css"
    })
  ];

  if (TARGET === 'analyze') {
    plugins.push(new BundleAnalyzerPlugin());
  }

  module.exports = merge(common, {
    mode: 'production',
    entry: {
      'react-phone-input': path.resolve(ROOT_PATH, 'src/index.js')
    },
    optimization: {},
    output: {
      path: path.resolve(ROOT_PATH, 'dist'),
      filename: 'lib.js',
      library: 'ReactPhoneInput',
      libraryTarget: 'umd',
      globalObject: 'this' // SSR ReferenceError: window is not defined
    },
    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              // options: {
              //   // you can specify a publicPath here
              //   // by default it use publicPath in webpackOptions.output
              //   publicPath: '../'
              // }
            },
            'css-loader',
            'less-loader'
          ]
        }
      ]
    },
    externals: [
      {
        react: {
          root: 'React',
          commonjs2: 'react',
          commonjs: 'react',
          amd: 'react'
        }
      }
    ],
    plugins
  });
}
