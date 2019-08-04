const babel = require('@babel/core')
const file = require('fs')
const fileText = file.readFileSync("/Users/ztesa/Desktop/ztesa-farm-wechat-buys-ssr/pages/_app.js",'utf-8')
const traverse = require('babel-traverse').default
const generate = require('babel-generator').default
const t = require('babel-types')
// const babel = require('babylon')
const plugins = {
    "presets": [
        [
            "next/babel"
        ]
    ],
    "plugins": [
        [
            "@babel/plugin-proposal-decorators",
            {
                "legacy": true
            }
        ],
    ]
}

const ast = babel.parse(fileText, plugins)
console.log('输出traverse', traverse)
traverse(ast, {
    Program(path) {
        path.node.body.forEach((e, index) => {
            if (e.type == "ImportDeclaration" && e.source.value == "react") {
                delete path.node.body[index];
            }
        });
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
file.writeFileSync('./newBabel/test.js', text, 'utf-8')