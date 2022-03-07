const Webpack = require('../lib/index');
const path = require('path');
const jsonLoader = require('./loader/jsonLoader.js');

const entry = './__test__/example/index.js';
const output = {
  path: path.resolve(__dirname, './dist'),
  filename: 'index.js'
};

const loaders = {
  rules: [
    {
      test: /.json$/,
      use: [jsonLoader]
    }
  ]
};

describe('webpack', () => {
  it('test', () => {
    expect(true).toBe(true);
  });

  const wp = new Webpack({
    entry,
    output,
    module: loaders
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
    expect(wp.parseModules(entry)).toMatchObject({
      [entry]: {
        deps: {
          './a.js': './__test__/example/a.js'
        }
      },
      './__test__/example/a.js': {
        deps: {
          './utils/b.js': './__test__/example/utils/b.js'
        }
      },
      './__test__/example/utils/b.js': {
        deps: {
          './data.json': './__test__/example/utils/data.json'
        }
      },
      './__test__/example/utils/data.json': {
        deps: {}
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
