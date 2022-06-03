import { Lightning } from '@lightningjs/sdk'

export class Button extends Lightning.Component {
  static _template() {
    return {
      w: 300,
      h: 100,
      rect: true,
      color: 0xff1e1e1e,
      Label: {
        x: w => w / 2,
        y: h => h / 2,
        mount: 0.5,
        text: {
          text: this.bindProp('label'),
          textColor: 0xffffffff,
        },
      },
    }
  }

  _handleEnter() {
    this.action && typeof this.action === 'function' && this.action()
  }

  _focus() {
    this.color = 0xff39b54a
  }

  _unfocus() {
    this.color = 0xff1e1e1e
  }
}
