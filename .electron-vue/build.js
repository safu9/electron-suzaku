'use strict'

process.env.NODE_ENV = 'production'

const chalk = require('chalk')
const builder = require('electron-builder')
const rimraf = require('rimraf')
const webpack = require('webpack')
const Multispinner = require('multispinner')

const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')
const builderConfig = require('./builder.config')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '


build()

function build () {
  console.log(chalk.yellow.bold('starting build...') + '\n')
  rimraf.sync('dist')

  const configs = {
    main: mainConfig,
    renderer: rendererConfig
  }

  const m = new Multispinner(['main', 'renderer'], { preText: 'build', postText: 'process' })

  let results = ''

  const packProcess = async (name) => {
    try {
      const result = await pack(configs[name])
      m.success(name)
      results += result + '\n\n'
    } catch (err) {
      m.error(name)
      console.log(`\n  ${errorLog}failed to build ${name} process`)
      console.error(`\n${err}\n`)
      process.exit(1)
    }
  }

  packProcess('main')
  packProcess('renderer')

  m.on('success', async () => {
    console.log(`\n\n${results}`)
    console.log(`${okayLog} starting ${chalk.yellow('electron-builder')}...\n`)

    const result = await builder.build({ config: builderConfig, publish: 'never' })
    console.log(`\n${doneLog} build complete!`)
    result.forEach(file => console.log('  ' + file))
  })
}

function pack (config) {
  return new Promise((resolve, reject) => {
    config.mode = 'production'
    webpack(config, (err, stats) => {
      if (err) {
        reject(err.stack || err)
      } else if (stats.hasErrors()) {
        let err = ''

        stats
          .toString({
            chunks: false,
            colors: true
          })
          .split(/\r?\n/)
          .forEach(line => {
            err += `   ${line}\n`
          })

        reject(err)
      } else {
        resolve(stats.toString({
          chunks: false,
          colors: true
        }))
      }
    })
  })
}
