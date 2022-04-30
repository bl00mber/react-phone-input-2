const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const TARGET = process.env.TARGET;
const ROOT_PATH = path.resolve(__dirname);
const nodeModulesDir = path.join(ROOT_PATH, 'node_modules');

const common = {
  entry: {
    'lib/lib': path.resolve(ROOT_PATH, 'src/index.js')
  },
  output: {
    path: ROOT_PATH,
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['node_modules']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: [
          path.resolve(ROOT_PATH, 'src'),
          path.resolve(ROOT_PATH, 'test')
        ]
      },
      {
        test: /\.png.*$/,
        loaders: ['url-loader?limit=100000&mimetype=image/png'],
        exclude: /node_modules/
      }
    ]
  }
};

if (TARGET === 'dev_js' || TARGET === 'dev_css') {
  module.exports = merge(common, {
    mode: 'development',
    entry: {
      'demo': path.resolve(ROOT_PATH, 'test/' + TARGET + '/demo.js')
    },
    devtool: 'inline-source-map',
    devServer: {
      publicPath: 'http://localhost:3000/',
      port: '3000',
      host: '0.0.0.0',
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,
      contentBase: ['lib', 'test/index']
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

if (TARGET === 'build_js' || TARGET === 'analyze') {
  module.exports = merge(common, {
    mode: 'production',
    optimization: {},
    output: {
      library: 'ReactPhoneInput',
      libraryTarget: 'umd',
      globalObject: 'this'
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
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        },
        __DEV__: false
      }),
      ...(TARGET === 'analyze' ? [new BundleAnalyzerPlugin()] : [])
    ]
  });
}

if (TARGET === 'build_css') {
  module.exports = merge(common, {
    entry: [
      './src/style/style.less',
      './src/style/high-res.less',
      './src/style/material.less',
      './src/style/bootstrap.less',
      './src/style/semantic-ui.less',
      './src/style/plain.less'
    ],
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'lib/[name].css',
              }
            },
            'extract-loader',
            'css-loader',
            'less-loader'
          ]
        }
      ]
    }
  });
}
