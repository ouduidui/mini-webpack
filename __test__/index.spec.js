const Webpack = require('../lib/index');
const path = require('path');

const entry = './__test__/example/index.js';
const output = {
  path: path.resolve(__dirname, './dist'),
  filename: 'index.js'
};

describe('webpack', () => {
  it('test', () => {
    expect(true).toBe(true);
  });

  const wp = new Webpack({
    entry,
    output
  });

  it('constructor', () => {
    expect(wp.entry).toBe(entry);
    expect(wp.output).toBe(output);
  });

  it('getModuleInfo', () => {
    const info = wp.getModuleInfo(entry);
    expect(info).toEqual({
      file: entry,
      deps: {
        './a.js': './__test__/example/a.js'
      },
      code: '"use strict";\n\nvar _a = require("./a.js");\n\nconsole.log(_a.msg);'
    });
  });

  it('parseModules', () => {
    expect(wp.parseModules(entry)).toEqual({
      [entry]: {
        deps: {
          './a.js': './__test__/example/a.js'
        },
        code: '"use strict";\n\nvar _a = require("./a.js");\n\nconsole.log(_a.msg);'
      },
      './__test__/example/a.js': {
        deps: {
          './utils/b.js': './__test__/example/utils/b.js'
        },
        code:
          '"use strict";\n' +
          '\n' +
          'Object.defineProperty(exports, "__esModule", {\n' +
          '  value: true\n' +
          '});\n' +
          'exports.msg = void 0;\n' +
          '\n' +
          'var _b = require("./utils/b.js");\n' +
          '\n' +
          'var msg = "Hello ".concat(_b.something);\n' +
          'exports.msg = msg;'
      },
      './__test__/example/utils/b.js': {
        deps: {},
        code:
          '"use strict";\n' +
          '\n' +
          'Object.defineProperty(exports, "__esModule", {\n' +
          '  value: true\n' +
          '});\n' +
          'exports.something = void 0;\n' +
          "var something = 'World';\n" +
          'exports.something = something;'
      }
    });
  });

  it('run', (done) => {
    wp.run();
    const bundle = wp.content;
    console.log = jest.fn((msg) => {
      expect(msg).toBe('Hello World');
      done();
    });
    eval(bundle);
  });
});
