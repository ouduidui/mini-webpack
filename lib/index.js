const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const path = require('path');
const babel = require('@babel/core');
const { SyncHook } = require('tapable');

class Webpack {
  constructor(options) {
    this.entry = options.entry; // 入口文件
    this.output = options.output; // 导出配置
    this.module = options.module; // loader配置

    this.depsGraph = {}; // 存放模块代码
    this.content = ''; // 导出bundle代码 （测试用）

    // 初始化hooks
    this.hooks = {
      beforeRun: new SyncHook()
    };
    // 注册插件
    if (options.plugins && options.plugins.length) {
      options.plugins.forEach((plugin) => {
        plugin.apply({ hooks: this.hooks });
      });
    }
  }

  /**
   * 核心运行代码
   *   - 解析模块
   *   - 执行打包
   */
  run() {
    // 触发beforeRun钩子
    this.hooks.beforeRun.call();
    // 解析模块
    this.depsGraph = this.parseModules(this.entry);
    // 执行打包
    this.bundle();
  }

  /**
   * 从入口文件开始解析模块
   * @param {string} file
   * @returns {Record<string, {deps: Record<string, string>[], code: string}>}
   */
  parseModules(file) {
    // 分析入口文件
    const entry = this.getModuleInfo(file);

    // 存储所有模块数据
    const temp = [entry];
    // 递归遍历，找到所有的模块代码
    this.getDeps(temp, entry);

    // 将temp转换成对象
    const depsGraph = {};
    temp.forEach((moduleInfo) => {
      depsGraph[moduleInfo.file] = {
        deps: moduleInfo.deps,
        code: moduleInfo.code
      };
    });

    return depsGraph;
  }

  /**
   * 分析file模块，解析代码和引入模块
   * @param {string} file
   * @returns {{file: string, deps: Record<string, string>, code: string}}
   */
  getModuleInfo(file) {
    // 读取入口文件
    let body = fs.readFileSync(file, 'utf8');

    // 执行loader
    if (this.module.rules && this.module.rules.length) {
      this.module.rules.forEach((rule) => {
        // 如果文件匹配到上，则倒序执行loaders
        if (rule.test.test(file)) {
          body = rule.use.reduceRight((acc, cur) => {
            acc = cur.call(this, acc);
            return acc;
          }, body);
        }
      });
    }

    // 转换成AST语法树
    const ast = parser.parse(body, {
      sourceType: 'module' // 解析的是ES模块
    });

    /**
     * 依赖收集（去重）
     * @type {Record<string, string>}
     */
    const deps = {};
    // 以入口文件作为根目录
    const dirname = path.dirname(file);
    // 对AST树进行遍历
    traverse(ast, {
      // 针对 import 语句做处理
      ImportDeclaration({ node }) {
        // 引入文件相对入口文件的路径
        const absPath = './' + path.join(dirname, node.source.value);
        // 依赖收集
        deps[node.source.value] = absPath;
      }
    });

    // 转成ES5语法
    const { code } = babel.transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    });

    return {
      file, // 文件路径
      deps, // 该文件的引入模块
      code // 代码字符串
    };
  }

  /**
   * 递归分析依赖
   * @param {{file: string, deps: Record<string, string>, code: string}[]} temp
   * @param {{file: string, deps: Record<string, string>, code: string}} entry
   */
  getDeps(temp, { deps }) {
    // 遍历所有引入模块
    Object.keys(deps).forEach((key) => {
      // 对应的模块还没有分析的话，对其执行分析
      if (!temp.some((m) => m.file === deps[key])) {
        // 对其模块进行分析，并存入temp中
        const child = this.getModuleInfo(deps[key]);
        temp.push(child);
        // 继续递归遍历
        this.getDeps(temp, child);
      }
    });
  }

  bundle() {
    this.content = `
// 定义一个自调用函数，传入模块映射表
(function (__webpack_modules__) {
  // 核心函数，执行模块代码
  function __webpack_require__(moduleId) {
    // 定义require方法
    function require(relPath) {
      // 调用__webpack_require__函数，传入引入模块的路径
      return __webpack_require__(__webpack_modules__[moduleId].deps[relPath]);
    }
    // 存储导出模块
    var exports = {};

    // 自调用函数，执行代码
    (function (require, exports, code) {
      // 执行模块代码
      // 代码中可能会调用到require函数和exports对象
      eval(code);
    })(require, exports, __webpack_modules__[moduleId].code);

    // 返回模块导出内容
    return exports;
  }
  // 调用 __webpack_require__，传入入口文件
  __webpack_require__('${this.entry}');
})(${JSON.stringify(this.depsGraph)});
`;

    // 生成bundle文件
    if (!fs.existsSync(this.output.path)) {
      // 创建文件夹
      fs.mkdirSync(this.output.path);
    }

    const filePath = path.join(this.output.path, this.output.filename);
    fs.writeFileSync(filePath, this.content);
  }
}

module.exports = Webpack;
