'use strict'

const is = require( '@mojule/is' )

const defaultOptions = {
  getStateKey: state => state,
  isState: state => true,
  exposeState: false
}

const ApiFactory = ( modules = [], options = {} ) => {
  if( !is.array( modules ) )
    modules = [ modules ]

  if( !validModules( modules ) )
    throw new Error( 'Expected modules to be an array of functions' )

  options = Object.assign( {}, defaultOptions, options )

  const { getStateKey, isState, exposeState } = options

  const apiCache = new Map()
  const stateCache = new Map()

  const getState = instance => stateCache.get( instance )

  const Api = state => {
    if( !isState( state ) )
      throw new Error( 'Api state argument fails isState test' )

    const key = getStateKey( state )

    if( apiCache.has( key ) )
      return apiCache.get( key )

    const api = newState => Api( newState )

    const plugin = mod => Object.assign( api, mod( api, state, getState ) )

    if( exposeState )
      Object.assign( api, { state } )

    stateCache.set( api, state )

    modules.forEach( plugin )

    Object.keys( api ).forEach( key => {
      if( key.startsWith( '$' ) ){
        api[ key.slice( 1 ) ] = api[ key ]

        delete api[ key ]
      }
    })

    apiCache.set( key, api )

    return api
  }

  const statics = Statics( modules )

  Object.assign( Api, statics, { isState } )

  return Api
}

const validModules = modules =>
  is.array( modules ) && modules.every( is.function )

const Statics = modules =>
  modules.reduce( ( statics, mod ) => {
    const fns = mod( statics )

    const staticNames = Object.keys( fns ).filter( name =>
      name.startsWith( '$' )
    )

    staticNames.forEach( name => {
      const unprefixed = name.slice( 1 )

      statics[ unprefixed ] = fns[ name ]
    })

    return statics
  }, {} )

module.exports = ApiFactory
