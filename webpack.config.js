const path = require('path');

module.exports = {
  entry: './src/App.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    publicPath: '/public/'
  },
  target: 'electron-renderer',
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "fs": false // Assuming you don't want to polyfill 'fs'
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 100000,
        },
      },
    ],
  },
  externals: {
    'robotjs': 'commonjs robotjs'
  },
  watchOptions: {
    poll: true,
    ignored: /node_modules/
  },

};
