import { app, BrowserWindow, Menu } from 'electron'
import IPC from './ipc'

const path = require('path')
const i18next = require('i18next')
const i18nextBackend = require('i18next-node-fs-backend')


const isDevelopment = (process.env.NODE_ENV === 'development')

// Set `__static` path to static files in production
// https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
if (!isDevelopment) {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = isDevelopment
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`

async function createWindow () {
  mainWindow = new BrowserWindow({
    show: false,
    title: 'Suzaku',
    icon: path.join(__static, 'logo.png'),
    backgroundColor: '#fff',
    width: 1000,
    height: 550,
    minWidth: 800,
    minHeight: 400,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: !isDevelopment
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const ipc = new IPC(mainWindow.webContents)
  ipc.init()

  const t = await i18next.use(i18nextBackend).init({
    lng: app.getLocale(),
    fallbackLng: 'en',
    ns: ['main'],
    defaultNS: 'main',
    backend: {
      loadPath: path.join(__static, 'locales/{{lng}}/{{ns}}.json'),
      addPath: path.join(__static, 'locales/{{lng}}/{{ns}}.missing.json')
    }
  })

  const onMenuClick = (item, browserWindow, event) => {
    browserWindow.webContents.send('menu_clicked', item.id)
  }
  const template = [
    {
      label: t('file'),
      submenu: [
        {
          id: 'settings',
          label: t('settings'),
          accelerator: 'CmdOrCtrl + ,',
          click: onMenuClick
        },
        { type: 'separator' },
        {
          label: t('quit'),
          accelerator: 'CmdOrCtrl + Q',
          click () { app.quit() }
        }
      ]
    },
    {
      label: t('play'),
      submenu: [
        {
          id: 'play',
          label: t('play_pause'),
          accelerator: 'Space',
          click: onMenuClick
        },
        {
          id: 'next',
          label: t('next'),
          accelerator: 'CmdOrCtrl + Right',
          click: onMenuClick
        },
        {
          id: 'previous',
          label: t('previous'),
          accelerator: 'CmdOrCtrl + Left',
          click: onMenuClick
        },
        { type: 'separator' },
        {
          id: 'turnUp',
          label: t('turn_up'),
          accelerator: 'CmdOrCtrl + Up',
          click: onMenuClick
        },
        {
          id: 'turnDown',
          label: t('turn_down'),
          accelerator: 'CmdOrCtrl + Down',
          click: onMenuClick
        }
      ]
    }
  ]

  if (isDevelopment) {
    template.push({
      label: t('dev'),
      submenu: [
        { role: 'reload', accelerator: 'F5' },
        { role: 'forcereload', accelerator: 'Shift + F5' },
        { role: 'toggledevtools', accelerator: 'F12' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    })
  }

  const appMenu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(appMenu)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
