
            (function (__webpack_modules__) {
                function __webpack_require__(moduleId) {
                    function require(relPath) {
                        return __webpack_require__(__webpack_modules__[moduleId].deps[relPath])
                    }
                    var exports = {};
                    (function (require,exports,code) {
                        eval(code)
                    })(require,exports,__webpack_modules__[moduleId].code)
                    return exports
                }
                __webpack_require__('./src/index.js')
            })({"./src/index.js":{"deps":{"./a.js":"./src/a.js"},"code":"\"use strict\";\n\nvar _a = require(\"./a.js\");\n\nconsole.log(_a.msg);"},"./src/a.js":{"deps":{"./b.js":"./src/b.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.msg = void 0;\n\nvar _b = require(\"./b.js\");\n\nvar msg = \"Hello \".concat(_b.something);\nexports.msg = msg;"},"./src/b.js":{"deps":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.something = void 0;\nvar something = 'World';\nexports.something = something;"}})
        