import { Lightning, VideoPlayer, Registry } from '@lightningjs/sdk'
import { dashLoader, dashUnloader } from './dash'
import { Button } from './Button'

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
        Options: {
          w: w => w,
          h: 300,
          y: h => (2 * h) / 3,
          WidevineOption: {
            x: 750,
            mountX: 0.5,
            type: Button,
            label: 'Widevine',
            action: this.bindProp('_widevineAction'),
          },
          PlayReadyOption: {
            x: 1170,
            mountX: 0.5,
            type: Button,
            label: 'PlayReady',
            action: this.bindProp('_playReadyAction'),
          },
        },
      },
    }
  }

  get Background() {
    return this.tag('Background')
  }

  get Options() {
    return this.tag('Options')
  }

  _init() {
    this._setState('MediaOptions')
    this._playReadyAction = () => this._startPlayReadyMedia()
    this._widevineAction = () => this._startWidevineMedia()

    VideoPlayer.consumer(this)
    VideoPlayer.loader(dashLoader)
    VideoPlayer.unloader(dashUnloader)
  }

  _startWidevineMedia() {
    console.log('Starting Widevine DRM media')
    this._setState('MediaPlaying')

    const playerOpts = {
      protectionData: {
        'com.widevine.alpha': {
          serverURL: 'https://drm-widevine-licensing.axtest.net/AcquireLicense',
          httpRequestHeaders: {
            'X-AxDRM-Message':
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoxLCJjb21fa2V5X2lkIjoiYjMzNjRlYjUtNTFmNi00YWUzLThjOTgtMzNjZWQ1ZTMxYzc4IiwibWVzc2FnZSI6eyJ0eXBlIjoiZW50aXRsZW1lbnRfbWVzc2FnZSIsImtleXMiOlt7ImlkIjoiOWViNDA1MGQtZTQ0Yi00ODAyLTkzMmUtMjdkNzUwODNlMjY2IiwiZW5jcnlwdGVkX2tleSI6ImxLM09qSExZVzI0Y3Iya3RSNzRmbnc9PSJ9XX19.4lWwW46k-oWcah8oN18LPj5OLS5ZU-_AQv7fe0JhNjA',
          },
        },
      },
    }

    VideoPlayer.open(
      'https://media.axprod.net/TestVectors/v7-MultiDRM-SingleKey/Manifest_1080p.mpd',
      playerOpts
    )
  }

  _startPlayReadyMedia() {
    console.log('Starting PlayReady DRM media')
    this._setState('MediaPlaying')

    const playerOpts = {
      protectionData: {
        'com.microsoft.playready': {
          serverURL:
            'https://test.playready.microsoft.com/service/rightsmanager.asmx?cfg=(persist:false,sl:150)',
        },
      },
      // dash settings:
      streaming: {
        scheduling: {
          scheduleWhilePaused: false, // Stop the player from loading segments while paused
        },
        buffer: {
          fastSwitchEnabled: true, // Enable buffer replacement when switching bitrates for faster switching
        },
        abr: {
          maxBitrate: { audio: -1, video: 2500 }, // reduce bitrate to improve fluidity in this video sample
        },
      },
    }

    VideoPlayer.open(
      'https://profficialsite.origin.mediaservices.windows.net/c51358ea-9a5e-4322-8951-897d640fdfd7/tearsofsteel_4k.ism/manifest(format=mpd-time-csf)',
      playerOpts
    )
  }

  _clearErrorTimeout() {
    this._errorTimeout && Registry.clearTimeout(this._errorTimeout)
  }

  $videoPlayererror() {
    this._clearErrorTimeout()
    this._errorTimeout = Registry.setTimeout(() => {
      this.instructions = 'Error encountered.\n\nYour browser might not support this DRM system.'
    }, 5000)
  }

  $videoPlayerError(data) {
    console.error('Error playing video', data)
    this.instructions = 'Error playing video!'
  }

  $videoPlayerLoadedMetadata() {
    this._clearErrorTimeout()
    this.instructions = "Metadata loaded! If the video doesn't start soon, press enter or play"
  }

  $videoPlayerEvent(event, eventData) {
    console.log(event, eventData)
  }

  $videoPlayerPlaying() {
    this.Background.visible = false
  }

  $videoPlayerEnded() {
    this._setState('MediaOptions')
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

  static _states() {
    return [
      class MediaOptions extends App {
        $enter() {
          this.Options.visible = true
          this.Background.visible = true
          this.instructions = 'What DRM system would you like to test?'
          this._focusedElement = this.tag('WidevineOption')
        }
        $exit() {
          this.Options.visible = false
        }

        _handleLeft() {
          this._focusedElement = this.tag('WidevineOption')
        }

        _handleRight() {
          this._focusedElement = this.tag('PlayReadyOption')
        }

        _getFocused() {
          return this._focusedElement
        }
      },
      class MediaPlaying extends App {
        $enter() {
          this.instructions = 'Loading video...'
        }
        $exit() {
          VideoPlayer.clear()
        }
        _handleBack() {
          this._setState('MediaOptions')
        }
      },
    ]
  }
}
