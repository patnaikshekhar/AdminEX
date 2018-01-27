const path = require('path')
const RestartElectronPlugin = require('restart-electron-webpack-plugin')

module.exports = {
  
  entry: {
    projects: './src/components/projects.js' 
  },
  
  output: {
    path: path.join(__dirname, 'views', 'js'),
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.jsx?/i,
        loader: 'babel-loader',
        options: {
          presets: ['env'],
          plugins: [
            ['transform-react-jsx']
          ]
        }
      }
    ]
  },

  externals: [
    (function () {
      var IGNORES = [
        'electron',
        'child_process',
        'sfdx-node',
        '../src/main/sfdx'
      ]
      return function (context, request, callback) {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')");
        }
        return callback()
      }
    })()
  ],

  plugins: [
    new RestartElectronPlugin({
      // Defaults to process.cwd() + script 
      script: './index.js',
 
      // The command line arguments to launch electron (optional) 
      arguments: ["--enable-logging"]
    }),
  ]

  // SourceMaps
}