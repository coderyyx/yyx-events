var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
	  index : './src/index.js'
  },
  output: { 
    path:path.join(__dirname, "lib"),
    libraryTarget: "umd",  //一般都会选择umd
    filename: "bundle.js"
  },
  resolve: {
        extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { 
        test: /\.jsx?$/,loader: 'babel-loader',
        exclude: /node_modules/,
        query: {presets: ['es2015']}
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false,  // remove all comments
      },
      compress: {
        warnings: false
      }
    })
  ]
};