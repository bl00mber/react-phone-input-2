var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');

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
    filename: 'index.js'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel',
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
    // module: {
    //   loaders: [
    //     {
    //       test: /\.jsx?$/,
    //       loaders: ['react-hot', 'babel?stage=1'],
    //       include: path.resolve(ROOT_PATH, 'src')
    //     }
    //   ]
    // },
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
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('development')
        },
        '__DEV__': true
      })
    ]
  });
}


//Production configuration settings
if (TARGET === 'build') {
  module.exports = merge(common, {
    entry: {
      'react-phone-input': path.resolve(ROOT_PATH, 'src/index.js')
    },
    output: {
      path: path.resolve(ROOT_PATH, 'dist'),
      filename: 'index.js',
      library: 'ReactPhoneInput',
      libraryTarget: 'umd'
    },
    externals: [{
      "lodash": "lodash",
      "react": {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      }
    }],
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('production')
        },
        '__DEV__': false
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

