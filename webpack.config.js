// Configuration for webpack to bundle the React application
module.exports = {
  entry: './src/App.js',
  output: {
      path: require('path').resolve(__dirname, 'public'),
      filename: 'bundle.js',
  },
  module: {
      rules: [
          {
              test: /\.(js|jsx)$/,
              exclude: /node_modules/,
              use: {
                  loader: "babel-loader", // to bundle JSX and ES6
              },
          },
          {
              test: /\.css$/,
              use: ['style-loader', 'css-loader'], // to bundle CSS files
          },
          {
              test: /\.(png|woff|woff2|eot|ttf|svg)$/,
              loader: 'url-loader',
              options: {
                  limit: 100000,
              },
          }, // bundle the given fileset
      ],
  },
  //Used in development to watch for changes in the application
  watchOptions: {
      poll: true,
      ignored: /node_modules/,
  },
  devtool: 'source-map',
};