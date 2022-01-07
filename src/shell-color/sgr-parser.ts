import SGR, { SGROptions, SGRStyle } from './sgr';
import EventEmitter from 'wolfy87-eventemitter';

const ESCAPE_CODE_REG = /\x1b\[(?:(\d+)(?:;(\d+))*)?m/;
const ESCAPE_CODE_REG_MUL = /\x1b\[(?:\d+(?:;\d+)*)?m/g;
const ESCAPE_CODE_REG_FOR_SPLIT2 = /(\x1b\[(?:\d+(?:;\d+)*)?m)/g;

export default class SGRParser extends EventEmitter {
  private _sgr: SGR;

  constructor(options: SGROptions) {
    super();
    this._sgr = new SGR(options);
  }

  /**
   * Eliminate the ansi escape code in the string.
   * @param {string} str - a string with ansi escape code
   * @returns {string} returns the text without ansi escape code
   */
  static strip(str: string) {
    return str.replace(ESCAPE_CODE_REG_MUL, '');
  }

  _consumeCodes(escapeMatch: string[]) {
    if (escapeMatch.length == 3 && escapeMatch[1] == undefined && escapeMatch[2] == undefined) {
      return this._sgr.consumeCode(0); // default
    }
    // escapeMatch[0] == total string
    for (let i = 1; i < escapeMatch.length; i++) {
      const code = Number(escapeMatch[i]);
      this._sgr.consumeCode(code);
    }
  }

  _appendSnippet(text: string, style: SGRStyle) {
    this.trigger('snippet', [text, style]);
  }

  // when init
  _onReset() {
    this.trigger('reset', []);
    this.trigger('lineStart', []);
  }

  // when ShellColor receive text push
  _onWrite(text: string) {
    const snippets = text.split('\n');
    const firstSnippet = snippets[0];
    const style = this._sgr.getStyle();

    // first snippet belongs to last line
    if (firstSnippet != '') {
      this._appendSnippet(firstSnippet, style);
    }

    // add rest snippets
    for (let i = 1; i < snippets.length; i++) {
      this.trigger('lineEnd', []);
      this.trigger('lineStart', []);
      const snippet = snippets[i];
      if (snippet != '') {
        // ignore empty string
        this._appendSnippet(snippet, style);
      }
    }
  }

  /** Write text to stream and output a series of snippets with SGR info from event
   ** @param text - a string which has style info about styles
   */
  write(text: string) {
    // distinguish text and ansi escape code
    const fragments = text.split(ESCAPE_CODE_REG_FOR_SPLIT2);
    // transform each fragment
    fragments.forEach((fragment: string) => {
      const escapeMatch = fragment.match(ESCAPE_CODE_REG);
      if (escapeMatch) {
        // ansi escape code
        this._consumeCodes(escapeMatch);
      } else {
        // normal text
        this._onWrite(fragment);
      }
    });

    return this;
  }

  /** Reset SGR parameters and stream
   */
  reset() {
    this._onReset();
    return this;
  }
}
