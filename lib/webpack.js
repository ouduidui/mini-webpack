const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

module.exports = class Webpack {
    /**
     *  构造函数，获取webpack配置
     *  @param {*} options
     */
    constructor(options) {
        const {entry, output} = options;
        this.entry = entry;  // 入口文件
        this.output = output;  // 导出配置

        this.depsGraph = {};   // 存放模块代码
    }

    /**
     *  webpack运行函数
     */
    run() {
        // 解析模块
        this.depsGraph = this.parseModules(this.entry);

        // 打包
        this.bundle()
    }

    /**
     *  模块解析
     *  @param {*} file
     *  @returns Object
     */
    parseModules(file) {
        // 分析模块
        const entry = this.getModuleInfo(file);
        const temp = [entry];

        // 递归遍历，获取引入模块代码
        this.getDeps(temp, entry)

        // 将temp转成对象
        const depsGraph = {};
        temp.forEach(moduleInfo => {
            depsGraph[moduleInfo.file] = {
                deps: moduleInfo.deps,
                code: moduleInfo.code
            }
        })

        return depsGraph;
    }

    /**
     *  分析模块
     *  @param {*} file
     *  @returns Object
     */
    getModuleInfo(file) {
        // 读取文件
        const body = fs.readFileSync(file, "utf-8");

        // 转化为AST语法树
        const ast = parser.parse(body, {
            sourceType: 'module'  // 表示我们解析的是ES模块
        })

        // 依赖收集
        const deps = {};
        traverse(ast, {
            // visitor函数
            ImportDeclaration({node}) {
                // 入口文件路径
                const dirname = path.dirname(file);
                // 引入文件路径
                const absPath = "./" + path.join(dirname, node.source.value);
                deps[node.source.value] = absPath;
            }
        })

        // ES6转成ES5
        const {code} = babel.transformFromAst(ast, null, {
            presets: ["@babel/preset-env"],
        })

        return {
            file,   // 文件路径
            deps,  // 依赖对象
            code   // 代码
        };
    }


    /**
     * 获取依赖
     *  @param {*} temp
     *  @param {*} module
     */
    getDeps(temp, {deps}) {
        // 遍历依赖
        Object.keys(deps).forEach(key => {
            // 去重
            if (!temp.some(m => m.file === deps[key])) {
                // 获取依赖模块代码
                const child = this.getModuleInfo(deps[key]);
                temp.push(child);
                // 递归遍历
                this.getDeps(temp, child);
            }
        })
    }

    /**
     *  生成bundle文件
     */
    bundle() {
        const content = `
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
                __webpack_require__('${this.entry}')
            })(${JSON.stringify(this.depsGraph)})
        `;

        // 生成bundle文件
        !fs.existsSync(this.output.path) && fs.mkdirSync(this.output.path);
        const filePath = path.join(this.output.path, this.output.filename);
        fs.writeFileSync(filePath, content);
    }
}