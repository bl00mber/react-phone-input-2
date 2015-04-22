var path = require('path');
var nodeModulesDir = path.join(__dirname, 'node_modules');

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
  devServer: {
    publicPath: 'http://localhost:8181/',
    port: '8181',
    hot: true,
    inline: true,
    lazy: false,
    noInfo: false,
    headers: {'Access-Control-Allow-Origin': '*'},
    stats: {colors: true}
  }
};

module.exports = config;
