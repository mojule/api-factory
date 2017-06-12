'use strict'

const core = api => {
  api.createState = ( ...args ) => args[ 0 ]
  api.getStateKey = state => state
  api.isState = state => true
  api.onCreate = api => {}
}

module.exports = [ core ]
