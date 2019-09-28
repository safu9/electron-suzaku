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

  const tasks = ['main', 'renderer']
  const m = new Multispinner(tasks, {
    preText: 'building',
    postText: 'process'
  })

  let results = ''

  pack(mainConfig).then(result => {
    m.success('main')
    results += result + '\n\n'
  }).catch(err => {
    m.error('main')
    console.log(`\n  ${errorLog}failed to build main process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })

  pack(rendererConfig).then(result => {
    m.success('renderer')
    results += result + '\n\n'
  }).catch(err => {
    m.error('renderer')
    console.log(`\n  ${errorLog}failed to build renderer process`)
    console.error(`\n${err}\n`)
    process.exit(1)
  })

  m.on('success', () => {
    console.log(`\n\n${results}`)
    console.log(`${okayLog} starting ${chalk.yellow('electron-builder')}...\n`)

    builder.build({config: builderConfig}).then(result => {
      console.log(`\n${doneLog} build complete!`)
      result.forEach(file => console.log(file))
    })
  })
}

function pack (config) {
  return new Promise((resolve, reject) => {
    config.mode = 'production'
    webpack(config, (err, stats) => {
      if (err) reject(err.stack || err)
      else if (stats.hasErrors()) {
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
