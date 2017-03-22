'use strict'

const is = require( '@mojule/is' )

const defaultOptions = {
  getStateKey: state => state,
  isState: state => true,
  exposeState: true
}

const ApiFactory = ( modules = [], options = {} ) => {
  if( !is.array( modules ) )
    modules = [ modules ]

  if( !validModules( modules ) )
    throw new Error( 'Expected modules to be an array of functions' )

  const { getStateKey, isState, exposeState } = Object.assign(
    {}, defaultOptions, options
  )

  const apiCache = new Map()

  const Api = state => {
    if( !isState( state ) )
      throw new Error( 'Api state argument fails isState test' )

    const key = getStateKey( state )

    if( apiCache.has( key ) )
      return apiCache.get( key )

    const api = newState => Api( newState )

    const plugin = mod =>
      Object.assign( api, mod( api, state )  )

    if( exposeState )
      Object.assign( api, { state } )

    modules.forEach( plugin )

    apiCache.set( key, api )

    return api
  }

  Object.assign( Api, { isState } )

  return Api
}

const validModules = modules =>
  is.array( modules ) && modules.every( is.function )

module.exports = ApiFactory
