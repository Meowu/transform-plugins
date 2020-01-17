const pluginTester = require('babel-plugin-tester');
const plugin = require('../src');
const path = require('path');
pluginTester.default({
  plugin,
  fixtures: path.join(__dirname, 'fixtures')
})