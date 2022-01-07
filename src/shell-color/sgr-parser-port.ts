import EventEmitter from 'wolfy87-eventemitter';

export type SGRParserPortOptions = {
  workerPath: string;
  callback: Function;
};

export default class SGRParserPort extends EventEmitter {
  private readonly _callback: Function;
  private readonly _worker: Worker;

  constructor(options: SGRParserPortOptions) {
    super();
    this._callback = options.callback;
    this._worker = new Worker(options.workerPath);
    // @ts-ignore
    delete options.callback; // can not pass by postMessage

    this._worker.addEventListener('message', (event) => {
      const data = event.data;
      switch (data.type) {
        case 'connect':
          this._worker.postMessage({
            type: 'init',
            options: options,
          });
          break;
        case 'init':
          this._callback();
          break;
        case 'reset':
          this.trigger('reset', []);
          break;
        case 'lineStart':
          this.trigger('lineStart', []);
          break;
        case 'snippet':
          this.trigger('snippet', [data.text, data.sgr]);
          break;
        case 'lineEnd':
          this.trigger('lineEnd', []);
          break;
      }
    });
  }

  reset() {
    this._worker.postMessage({
      type: 'reset',
    });
  }

  write(text: string) {
    this._worker.postMessage({
      type: 'write',
      text: text,
    });
  }

  stop() {
    this._worker.terminate();
  }
}
