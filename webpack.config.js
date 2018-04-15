const path = require('path')
const RestartElectronPlugin = require('restart-electron-webpack-plugin')

module.exports = {
  
  entry: {
    projects: './src/components/projects.js',
    createScratchOrg: './src/components/createScratchOrg.js',
    createFeature: './src/components/createFeature.js',
    pullDifferences: './src/components/pullDifferences.js',
    diff: './src/components/diff.js',
    connectSandbox: './src/components/connectSandbox.js',
    showLimits: './src/components/showLimits.js',
    deployToSandbox: './src/components/deployToSandbox.js'
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
        '../src/main/sfdx',
        'path',
        'fs'
      ]
      return function (context, request, callback) {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')");
        }
        return callback()
      }
    })()
    , "fuzzy-match-utils"],

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