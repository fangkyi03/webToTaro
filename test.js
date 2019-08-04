const babel = require('@babel/core')
const file = require('fs')
const path = require('path')
const traverse = require('babel-traverse').default
const generate = require('babel-generator').default
const t = require('babel-types')
const process = require('process'); 
// const child_process = require('child_process')
// const babel = require('babylon')
class WebToTaro {
    constructor({ option, plugins, root, outPath }) {
        this.option = option
        this.fileArr = []
        this.outPath = outPath
        this.root = root;
        // let pluginsArr = [
        //     [
        //        require("@babel/plugin-proposal-decorators"),
        //         {
        //             "legacy": true
        //         }
        //     ]
        // ]
        this.plugins = {
                "presets": [
                    // "@babel/preset-env",
                    "@babel/preset-react",
                ],
                // "plugins": [
                //     [
                //         "@babel/plugin-proposal-decorators",
                //         {
                //             "legacy": true
                //         }
                //     ],
                // ]
            }
        // child_process.exec(`rm -rf ${path.join(this.root,this.outPath)}`)
        this.createDir(path.join(this.root,this.outPath))
    }

    // 扫描一个文件夹 只匹配js文件
    scanDir(dirPath) {
        const scanPath = path.join(this.root, dirPath)
        const state = file.statSync(scanPath)
        if (state.isFile() && path.extname(fileDir) == '.js') {
            this.scanFile(path.join(dirPath))
        } else {
            this.createDir(path.join(this.root,this.outPath,dirPath))
            const files = file.readdirSync(scanPath)
            files.forEach((e) => {
                const fileDir = path.join(scanPath, e);
                const fileState = file.statSync(fileDir)
                if (fileState.isFile() && path.extname(fileDir) == '.js') {
                    this.scanFile(path.join(dirPath,e))
                } else if (fileState.isDirectory()) {
                    this.createDir(path.join(this.root,this.outPath,dirPath, e))
                    this.scanDir(path.join(dirPath, e))
                }
            })
        }
    }

    // 创建文件
    createDir(dir) {
        if (!file.existsSync(dir)) {
            file.mkdirSync(dir)
        }
    }

    // 添加单个扫描文件
    scanFile(filePath) {
        this.fileArr.push(filePath)
    }

    // 转换所有文件
    tranFormArr() {
        this.fileArr.forEach((e) => {
            this.tranFormFile(e)
            console.log('文件转换完毕', e)
        })
    }

    // 转换单个文件
    tranFormFile(filePath) {
        const fileText = file.readFileSync(path.join(this.root, filePath), 'utf-8')
        const ast = babel.parse(fileText, {...this.plugins,filename:'./babel.config.js'})
        traverse(ast, {
            Program(path) {
                path.node.body.forEach((e, index) => {
                    if (e.type == "ImportDeclaration" && e.source.value == "react") {
                        delete path.node.body[index];
                    }
                });
                const data = ['Image', 'View', 'Text']
                path.node.body.unshift(t.importDefaultSpecifier(t.identifier(`import {${data}} from '@tarojs/components';`)));
                path.node.body.unshift(t.importDefaultSpecifier(t.identifier("import Taro from '@tarojs/taro';")));
            },
            JSXIdentifier(path) {
                const obj = {
                    div: "View",
                    img: "Image"
                };
                if (obj[path.node.name]) {
                    path.node.name = obj[path.node.name];
                }
            }
        })
        const text = generate(ast).code

        file.writeFileSync(path.join(this.root,this.outPath,filePath), text, 'utf-8')
    }
}
const webTaro = new WebToTaro({
    root: path.join(__dirname,'../ztesa-farm-wechat-buys-ssr'),
    plugins: '/.babelrc',
    outPath:'/babelOut'
})
webTaro.scanDir('/pages/')

webTaro.tranFormArr()
