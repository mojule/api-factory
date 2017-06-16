'use strict'

const corePlugin = ({ core }) => {
  const stateMap = new Map()
  const apiMap = new Map()

  core.createState = ( ...args ) => args[ 0 ]
  core.getStateKey = state => state
  core.isState = state => true
  core.onCreate = api => {}

  core.getState = api => stateMap.get( api )
  core.getApi = state => apiMap.get( core.getStateKey( state ) )
  core.hasApi = state => apiMap.has( core.getStateKey( state ) )

  core.memoizeApi = ( api, state ) => {
    stateMap.set( api, state )
    apiMap.set( core.getStateKey( state ), api )
  }
}

module.exports = corePlugin
