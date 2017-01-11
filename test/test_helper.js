const fs = require('fs')
const vm = require('vm')
$ = require('jquery')

function load(filename) {
  vm.runInThisContext(fs.readFileSync(__dirname + '/../' + filename))
}


// TODO: make the below into a minitest-jquery package?

const { assert, refute, utils } = require('minitest')

assert.is = (selector, $obj, msg) => {
  assert($obj.is(selector),
         utils.message(msg, `Expected ${$obj.prop('outerHTML')} to match '${selector}'`))
}

assert.has = (selector, $obj, msg) => {
  assert($obj.has(selector).length > 0,
         utils.message(msg, `Expected ${$obj.prop('outerHTML')} to have a descendant that matches '${selector}'`))
}

refute.has = (selector, $obj, msg) => {
  refute($obj.has(selector).length > 0,
         utils.message(msg, `Expected ${$obj.prop('outerHTML')} to have no descendants that match '${selector}'`))
}

assert.hasClass = (className, $obj, msg) => {
  assert($obj.hasClass(className),
         utils.message(msg, `Expected ${$obj.prop('outerHTML')} to have class '${className}'`))
}

module.exports = { load, assert, refute, $ }