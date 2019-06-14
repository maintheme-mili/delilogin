const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  devServer: {
    port: 8090,
    // host: '192.168.0.125',
    proxy: {
      '/gateway': {
        target: 'http://192.168.0.204:9002/api',
        changeOrigin: true,
        pathRewrite: {
          '^/gateway': ''
        }
      }
    }
  },

  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        // 引入公共样式
        resolve('src/styles/variables.scss'),
        resolve('src/styles/mixins.scss')
      ]

    }
  },
  configureWebpack: {
    devtool: 'source-map'
  }
}
