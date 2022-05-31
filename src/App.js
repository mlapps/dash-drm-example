import { Lightning, VideoPlayer } from '@lightningjs/sdk'
import { dashLoader, dashUnloader } from './dash'

export default class App extends Lightning.Component {
  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        rect: true,
        color: 0xff000000,
        Instructions: {
          mount: 0.5,
          x: w => w / 2,
          y: h => h / 2,
          text: {
            text: this.bindProp('instructions'),
            color: 0xffffffff,
            textAlign: 'center',
          },
        },
      },
    }
  }

  _init() {
    this.instructions = 'Loading video...'

    VideoPlayer.consumer(this)
    VideoPlayer.loader(dashLoader)
    VideoPlayer.unloader(dashUnloader)

    const playerOpts = {
      protectionData: {
        'com.widevine.alpha': {
          serverURL: 'https://widevine-proxy.appspot.com/proxy',
        },
      },
    }
    VideoPlayer.open(
      'https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/mpds/11331.mpd',
      playerOpts
    )
  }

  $videoPlayererror({ event }) {
    if (event.name !== 'NotAllowedError') {
      this.instructions = 'Error encountered.\n\nDoes your browser support Widevine?'
    }
  }

  $videoPlayerLoadedMetadata() {
    this.instructions = 'Press Enter or Play to start the video'
  }

  $videoPlayerEvent(event, eventData) {
    console.log(event, eventData)
  }

  $videoPlayerPlaying() {
    this.tag('Background').setSmooth('alpha', 0)
  }

  _handleEnter() {
    VideoPlayer.playPause()
  }

  _handlePlay() {
    VideoPlayer.play()
  }

  _handlePause() {
    VideoPlayer.pause()
  }

  _handlePlayPause() {
    VideoPlayer.playPause()
  }

  _handleForward() {
    VideoPlayer.skip(10)
  }

  _handleRewind() {
    VideoPlayer.skip(-10)
  }

  _handleRight() {
    VideoPlayer.skip(10)
  }

  _handleLeft() {
    VideoPlayer.skip(-10)
  }
}
