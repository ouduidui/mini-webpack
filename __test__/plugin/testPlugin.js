class TestPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tap('TestPlugin', () => {
      console.log('webpack 构建准备开始了！');
    });
  }
}

module.exports = TestPlugin;
