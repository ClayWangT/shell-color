export type SGROptions = {
  defaultForegroundColor: string;
  defaultBackgroundColor: string;
};
export type SGRStyle = {
  color?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  deletion?: boolean;
  overline?: boolean;
};

export default class SGR {
  private _options: SGROptions;
  private _sgr: SGRStyle = {};

  constructor(options: SGROptions) {
    this._options = options;
    this.consumeCode(0);
  }

  /** Get SGR color name by SGR color code */
  _getSGRColor(sgrCode: number) {
    const n = sgrCode % 10;
    switch (n) {
      case 0:
        return 'black';
      case 1:
        return 'red';
      case 2:
        return 'green';
      case 3:
        return 'yellow';
      case 4:
        return 'blue';
      case 5:
        return 'magenta';
      case 6:
        return 'cyan';
      case 7:
        return 'white';
      default:
        throw sgrCode + ' is invalid SGR color code';
    }
  }

  /** Parse code and apply property to sgr Object */
  consumeCode(code: number) {
    const sgr = this._sgr;
    switch (code) {
      case 0:
        sgr.color = this._options.defaultForegroundColor;
        sgr.background = this._options.defaultBackgroundColor;
        sgr.bold = false;
        sgr.italic = false;
        sgr.underline = false;
        sgr.deletion = false;
        sgr.overline = false;
        break;
      case 1:
        sgr.bold = true;
        break;
      case 3:
        sgr.italic = true;
        break;
      case 4:
        sgr.underline = true;
        break;
      case 9:
        sgr.deletion = true;
        break;
      case 22:
        sgr.bold = false;
        break;
      case 23:
        sgr.italic = false;
        break;
      case 24:
        sgr.underline = false;
        break;
      case 29:
        sgr.deletion = false;
        break;
      case 30:
      case 31:
      case 32:
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
        sgr.color = this._getSGRColor(code);
        break;
      case 39:
        sgr.color = this._options.defaultForegroundColor;
        break;
      case 40:
      case 41:
      case 42:
      case 43:
      case 44:
      case 45:
      case 46:
      case 47:
        sgr.background = this._getSGRColor(code);
        break;
      case 49:
        sgr.background = this._options.defaultBackgroundColor;
        break;
      case 53:
        sgr.overline = true;
        break;
      case 55:
        sgr.overline = false;
        break;
    }
    return sgr; // maybe should return clone of sgr
  }

  initDefaultSGR() {
    this.consumeCode(0);
  }

  getStyle() {
    return this._sgr;
  }
}
