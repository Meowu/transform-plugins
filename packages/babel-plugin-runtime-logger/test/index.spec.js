const pluginTester = require('babel-plugin-tester');
// import pluginTester from 'babel-plugin-tester'
const plugin = require('../src');
const path = require('path');

pluginTester({
  plugin,
  fixtures: path.join(__dirname, 'fixtures')
})