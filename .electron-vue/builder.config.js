// config for electron-builder

const builderConfig = {
  productName: 'Suzaku',
  appId: 'dev.safu9.suzaku',
  directories: {
    output: 'build'
  },
  files: [
    'dist/**/*'
  ],
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ]
  },
  mac: {
    icon: 'icons/icon.icns'
  },
  win: {
    icon: 'icons/icon.ico'
  },
  linux: {
    category: 'Audio',
    icon: 'icons'
  }
}

module.exports = builderConfig
