import dashjs from 'dashjs'
import { VideoPlayer } from '@lightningjs/sdk'

let player = null
const defaults = {
  debug: {
    logLevel: dashjs.Debug.LOG_LEVEL_DEBUG, // Turn off console logging
  },
  streaming: {
    scheduling: {
      scheduleWhilePaused: false, // Stop the player from loading segments while paused
    },
    buffer: {
      fastSwitchEnabled: true, // Enable buffer replacement when switching bitrates for faster switching
    },
  },
}
/* Example of how protectionData can be set
   For full documentation see: https://github.com/Dash-Industry-Forum/dash.js/wiki/Digital-Rights-Management-(DRM)-and-license-acquisition

{
  'com.widevine.alpha': {
    serverURL: 'someurl',
    priority: 1
  },
  'com.microsoft.playready': {
    serverURL: 'someurl',
    priority: 2
  }
}

*/

const unload = videoEl => {
  if (player && player.destroy && player.destroy instanceof Function) {
    player.destroy()
    player = null
  }
  videoEl.removeAttribute('src')
  videoEl.load()
}

export const dashLoader = (url, videoEl, options = {}) => {
  return new Promise(resolve => {
    const opts = { ...options }
    const protectionData = opts.protectionData || null
    delete opts.protectionData

    unload(videoEl)

    player = dashjs.MediaPlayer().create()
    player.updateSettings({ ...defaults, ...opts })
    player.initialize()
    player.attachView(videoEl)
    if (protectionData) player.setProtectionData(protectionData)

    player.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, () => resolve())
    player.on(dashjs.MediaPlayer.events.ERROR, event => {
      if (VideoPlayer._consumer) {
        VideoPlayer._consumer.fire('$videoPlayerError', event, VideoPlayer.currentTime)
        VideoPlayer._consumer.fire('$videoPlayerEvent', 'Error', event, VideoPlayer.currentTime)
      }

      VideoPlayer.close()
    })

    player.attachSource(url)
  })
}

export const dashUnloader = videoEl => {
  return new Promise(resolve => {
    unload(videoEl)
    resolve()
  })
}
