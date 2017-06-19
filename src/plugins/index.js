'use strict'

const corePlugin = require( './corePlugin' )
const staticPlugin = require( './staticPlugin' )

module.exports = {
  core: [ corePlugin ],
  statics: [ staticPlugin ]
}
