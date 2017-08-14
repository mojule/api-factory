'use strict'

const properties = require( './core/properties' )
const state = require( './core/state' )

const factory = require( './statics/factory' )

module.exports = {
  core: [ properties, state ],
  statics: [ factory ]
}
