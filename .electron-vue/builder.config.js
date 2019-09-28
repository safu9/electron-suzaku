// config for electron-builder

const builderConfig = {
  'productName': 'suzaku',
  'appId': 'net.safu9.suzaku',
  'directories': {
    'output': 'build'
  },
  'files': [
    'dist/**/*'
  ],
  'dmg': {
    'contents': [
      {
        'x': 410,
        'y': 150,
        'type': 'link',
        'path': '/Applications'
      },
      {
        'x': 130,
        'y': 150,
        'type': 'file'
      }
    ]
  },
  'mac': {
    'icon': 'build/icons/icon.icns'
  },
  'win': {
    'icon': 'build/icons/icon.ico'
  },
  'linux': {
    'icon': 'build/icons'
  }
}

module.exports = builderConfig
