const pluginTester = require('babel-plugin-tester');
// import pluginTester from 'babel-plugin-tester'
const plugin = require('../src');
const path = require('path');
// generated code with '·' before block {}, why ? 
pluginTester.default({
  plugin,
  fixtures: path.join(__dirname, 'fixtures')
})