<template>
  <div id="settings-page">
    <div class="clearfix">
      <p id="title">{{ $t('settings') }}</p>
    </div>

    <hr/>

    <label>{{ $t('library_folders') }}</label>
    <div id="folder">
      <div v-for="dir in dirs" :key="dir"
        class="listitem" @click="removeFolder(dir)">
        <SvgIcon icon="close" />
        <span class="item-name">{{ dir }}</span>
      </div>
      <div class="listitem" @click="addFolder">
        <SvgIcon icon="add" />
        <span class="item-name">{{ $t('add_folder') }}</span>
      </div>
    </div>

    <button @click="scanLibrary" :disabled="isScannig">
      {{ $t('rescan_library') }}
    </button>
  </div>
</template>

<script>
import SvgIcon from '@/components/SvgIcon'

const { dialog } = require('electron').remote
const settings = require('electron-settings')

export default {
  components: {
    SvgIcon
  },
  data () {
    return {
      dirs: settings.get('core.dirs', []),
      changed: {},
      isScannig: false
    }
  },
  mounted () {
    this.$electron.ipcRenderer.on('scan_complete', this.onScanComplete)
  },
  beforeDestroy () {
    if (this.changed.dirs) {
      settings.set('core.dirs', this.dirs)
      this.scanLibrary()
    }
  },
  methods: {
    async addFolder () {
      const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
      const dirs = result && result.filePaths

      if (dirs && !this.dirs.includes(dirs[0])) {
        this.dirs.push(dirs[0])
        this.changed.dirs = true
      }
    },
    removeFolder (dir) {
      this.dirs = this.dirs.filter(i => i !== dir)
      this.changed.dirs = true
    },
    scanLibrary () {
      this.isScannig = true
      this.$electron.ipcRenderer.send('scan_dirs')
    },
    onScanComplete () {
      this.isScannig = false
    }
  }
}
</script>

<style lang="scss">
#settings-page {
  #title {
    font-size: 1.2em;
    font-weight: bold;
  }

  label {
    display: block;
    font-size: 1.1em;
    font-weight: bold;
    padding: 10px 0;
  }

  .listitem {
    display: block;
    margin: 0;
    padding: 5px 10px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color .2s ease;
    font-size: 16px;
    line-height: 22px;
    &:first-child {
      border-top: 1px solid #eee;
    }
    &:hover {
      background-color: rgba(0, 0, 0, .03);
    }

    .item-name {
      vertical-align: middle;
    }
  }

  button {
    padding: 0.5em;
    margin: 1em 0;
    border: 1px solid #ddd;
    border-radius: .2em;

    &:disabled {
      cursor: default;
    }
  }
}
</style>
