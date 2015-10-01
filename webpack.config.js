var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');

var pkg = require('./package.json');

var TARGET = process.env.TARGET;
var ROOT_PATH = path.resolve(__dirname);
var nodeModulesDir = path.join(ROOT_PATH, 'node_modules');

//Common configuration settings
var common = {
  entry: path.resolve(ROOT_PATH, 'src/index.js'),
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules']
  },
  output: {
    path: path.resolve(ROOT_PATH, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel?optional[]=runtime&stage=0',
        include: path.resolve(ROOT_PATH, 'src')
      },
      {
        test: /\.png.*$/,
        loaders: ['url-loader?limit=100000&mimetype=image/png'],
        exclude: /node_modules/
      },
      {
        test: /\.less$/,
        loader: "style!css!less"
      }
    ]
  }
};

//Development configuration settings
if (TARGET === 'dev') {
  module.exports = merge(common, {
    devtool: 'eval',
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loaders: ['react-hot', 'babel?stage=1'],
          include: path.resolve(ROOT_PATH, 'app')
        }
      ]
    },
    devServer: {
      publicPath: 'http://localhost:8181/',
      port: '8181',
      host: '0.0.0.0',
      colors: true,
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,
      contentBase: 'dist'
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  });
}

//Production configuration settings
if (TARGET === 'build') {
  module.exports = merge(common, {
    entry: {
      app: path.resolve(ROOT_PATH, 'src/index.js'),
      vendor: Object.keys(pkg.dependencies)
    },
    output: {
      path: path.resolve(ROOT_PATH, 'dist'),
      filename: 'bundle.js'
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin(
        'vendor',
        'vendors.js'
      ),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      }),
      new webpack.optimize.DedupePlugin()
    ]
  });
}

