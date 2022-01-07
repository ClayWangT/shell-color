import SGRParser from './sgr-parser';
import SGRParserPort from './sgr-parser-port';
import { SGROptions, SGRStyle } from './sgr';
import EventEmitter from 'wolfy87-eventemitter';
import React from 'react';

const DEFAULT_FOREGROUND_COLOR = 'white';
const DEFAULT_BACKGROUND_COLOR = 'black';

export type ShellColorOptions = Partial<
  {
    snippetTag: keyof HTMLElementTagNameMap;
    lineTag: keyof HTMLElementTagNameMap;
    colorMap: Record<string, string>;
    useWorker: boolean;
    worker: {
      path: string;
      callback: Function;
    };
  } & SGROptions
>;

export default class ShellColor extends EventEmitter {
  private readonly _colorMap: Record<string, string>;
  private readonly _snippetTag: keyof HTMLElementTagNameMap;
  private readonly _parser: SGRParserPort | SGRParser;

  constructor(options: ShellColorOptions = {}) {
    super();
    this._colorMap = options.colorMap || {};
    this._snippetTag = options.snippetTag || 'span';

    const defaultForegroundColor = options.defaultForegroundColor || DEFAULT_FOREGROUND_COLOR;
    const defaultBackgroundColor = options.defaultBackgroundColor || DEFAULT_BACKGROUND_COLOR;
    if (options.useWorker && options.worker) {
      this._parser = new SGRParserPort({
        workerPath: options.worker.path,
        callback: options.worker.callback,
      });
    } else {
      this._parser = new SGRParser({
        defaultForegroundColor,
        defaultBackgroundColor,
      });
    }

    this._parser.on('reset', () => {
      this.trigger('reset', []);
    });

    this._parser.on('lineStart', () => {
      this.trigger('lineStart', []);
    });

    this._parser.on('snippet', (text: string, sgr: SGRStyle) => {
      this.trigger('snippet', [this._createInlineTag(text, sgr), text, sgr]);
    });

    this._parser.on('lineEnd', () => {
      this.trigger('lineEnd', []);
    });
  }

  /**
   * Eliminate the ansi escape code in the string.
   * @memberof! ShellColor
   * @param {string} str - a string with ansi escape code
   * @returns {string} returns the text without ansi escape code
   */
  static strip(str: string) {
    return SGRParser.strip(str);
  }

  /**
   * Convert string which has style info to html tags.
   * @param str - a string which has style info about styles
   * @param options:
   *      lineTag:    default is p
   *      snippetTag: default is span
   *      others of ShellColor
   * @returns {Array} html tags include text, tag is used for hold styles
   */
  static toBlockTags(str: string, options: ShellColorOptions) {
    const lineTag = options.lineTag || 'p';

    const sc = new ShellColor(options);
    const tags: React.ReactNode[] = [];
    sc.on('snippet', function (tag: React.ReactNode) {
      tags.push(React.createElement(lineTag, {}, tag));
    });
    sc.reset();
    sc.write(str);

    return tags;
  }

  /** Convert string to all inline tags
   ** text: the string
   ** options:
   **     snippetTag: default is span
   **     others of ShellColor
   */
  static toInlineTags(text: string, options: ShellColorOptions) {
    const sc = new ShellColor(options);
    const tags: React.ReactNode[] = [];
    sc.on('lineEnd', function () {
      const br = React.createElement('br');
      tags.push(br);
    });
    sc.on('snippet', function (tag: React.ReactNode) {
      tags.push(tag);
    });
    sc.reset();
    sc.write(text);

    return tags;
  }

  // Get color css by SGR color name
  _getCssColor(sgrColor: string) {
    if (sgrColor in this._colorMap) {
      return this._colorMap[sgrColor];
    }
    switch (sgrColor) {
      case 'black':
        return '#000000';
      case 'red':
        return '#FF4136';
      case 'green':
        return '#2ECC40';
      case 'yellow':
        return '#FFDC00';
      case 'blue':
        return '#0074FF';
      case 'magenta':
        return '#b544aB';
      case 'cyan':
        return '#00FFff';
      case 'white':
        return '#FFFFFF';
      default:
        return sgrColor;
    }
  }

  _createInlineTag(text: string, sgr: SGRStyle) {
    return React.createElement(
      this._snippetTag,
      {
        style: {
          color: this._getCssColor(sgr.color || DEFAULT_FOREGROUND_COLOR),
          background: this._getCssColor(sgr.background || DEFAULT_BACKGROUND_COLOR),
          fontWeight: sgr.italic ? 'italic' : 'normal',
          textDecoration: `${sgr.underline ? 'underline' : ''}${
            sgr.deletion ? ' line-through' : ''
          }${sgr.overline ? ' overline' : ''}`,
        },
      },
      text,
    );
  }

  reset() {
    this._parser.reset();
    return this;
  }

  write(text: string) {
    this._parser.write(text);
    return this;
  }

  stopWorker() {
    if (this._parser instanceof SGRParserPort) {
      this._parser.stop();
    } else {
      throw new Error('not a worker mode');
    }
  }
}
