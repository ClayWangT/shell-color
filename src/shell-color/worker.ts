import SGRParser from './sgr-parser';
import { SGROptions, SGRStyle } from './sgr';

let parser: SGRParser | undefined;

const initParser = function (options: SGROptions) {
  parser = new SGRParser(options);

  parser.on('reset', function () {
    // @ts-ignore
    postMessage({
      type: 'reset',
    });
  });

  parser.on('snippet', function (text: string, sgr: SGRStyle) {
    // @ts-ignore
    postMessage({
      type: 'snippet',
      text: text,
      sgr: sgr,
    });
  });

  parser.on('lineStart', function () {
    // @ts-ignore
    postMessage({
      type: 'lineStart',
    });
  });

  parser.on('lineEnd', function () {
    // @ts-ignore
    postMessage({
      type: 'lineEnd',
    });
  });
};

onmessage = function (event) {
  const data = event.data;
  switch (data.type) {
    case 'init':
      initParser(data.options);
      // @ts-ignore
      postMessage({
        type: 'init',
      });
      break;
    case 'reset':
      parser?.reset();
      break;
    case 'write':
      parser?.write(data.text);
      break;
  }
};
// @ts-ignore
postMessage({
  // reset/write should after connect/init
  type: 'connect',
});
