//Configuration for webpack to bundle the React application
module.exports = {
    entry:'./src/App.js',
    output:{
        path: __dirname + "/public",
        filename:'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
          loader: "babel-loader" // to bundle JSX and ES6
          }
        },
        {
            test:/\.css$/,
            use:['style-loader','css-loader'] // to bundle css files
        },
        { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' } // bundle the given fileset
      ]
    },
    //used in development to watch for changes in the application
    watchOptions: {
      poll: true,
      ignored: /node_modules/
    }
  };