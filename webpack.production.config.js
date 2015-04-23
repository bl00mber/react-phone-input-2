var path = require('path');
var nodeModulesDir = path.join(__dirname, 'node_modules');
var webpack = require('webpack');
var config = {
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  resolve: {
    modulesDirectories: ['node_modules']
  },
  module: {
    loaders: [
      {test: /\.(js|jsx)$/, loader: 'jsx-loader', exclude: [nodeModulesDir]},
      {test: /\.(js|jsx)$/, loader: 'babel-loader', exclude: [nodeModulesDir]},
      {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
      {test: /\.png$/, loader: 'file-loader'}
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
};

module.exports = config;
