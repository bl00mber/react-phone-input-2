const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
    filename: 'index.js'
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
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
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
      publicPath: 'http://localhost:8181/',
      port: '8181',
      host: '0.0.0.0',
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,
      contentBase: 'dist'
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
      filename: 'index.js',
      library: 'ReactPhoneInput',
      libraryTarget: 'umd'
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
