
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
  __webpack_require__('./__test__/example/index.js');
})({"./__test__/example/index.js":{"deps":{"./a.js":"./__test__/example/a.js"},"code":"\"use strict\";\n\nvar _a = require(\"./a.js\");\n\nconsole.log(_a.msg);"},"./__test__/example/a.js":{"deps":{"./utils/b.js":"./__test__/example/utils/b.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.msg = void 0;\n\nvar _b = require(\"./utils/b.js\");\n\nvar msg = \"Hello \".concat(_b.something);\nexports.msg = msg;"},"./__test__/example/utils/b.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.something = void 0;\nvar something = 'World';\nexports.something = something;"}});
