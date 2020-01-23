const pluginTester = require('babel-plugin-tester');
// import pluginTester from 'babel-plugin-tester'
const plugin = require('../src');
const path = require('path');
// generated code with '·' before block {}, why ? 
pluginTester.default({
  plugin,
  babelOptions: {
    "plugins": [
        ["@babel/plugin-proposal-decorators", { "legacy": true }],
        ["@babel/plugin-proposal-class-properties", { "loose": true }],
    ]
  },
  fixtures: path.join(__dirname, 'fixtures')
})