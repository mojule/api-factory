'use strict'

const is = require( '@mojule/is' )

const defaultOptions = {
  getStateKey: state => state,
  isState: state => true,
  exposeState: false,
  parseState: ( ...args ) => args[ 0 ]
}

const ApiFactory = ( modules = [], options = {} ) => {
  if( !is.array( modules ) )
    modules = [ modules ]

  if( !validModules( modules ) )
    throw new Error( 'Expected modules to be an array of functions' )

  options = Object.assign( {}, defaultOptions, options )

  const { getStateKey, isState, exposeState, parseState } = options

  const apiCache = new Map()
  const stateCache = new Map()

  const getState = instance => stateCache.get( instance )

  const Api = ( ...args ) => {
    const state = parseState( ...args )

    if( !isState( state ) )
      throw new Error( 'Api state argument fails isState test' )

    const key = getStateKey( state )

    if( apiCache.has( key ) )
      return apiCache.get( key )

    const api = ( ...args ) => Api( ...args )

    const plugin = mod => {
      const modApi = mod( api, state, getState )

      Object.keys( modApi ).forEach( key => {
        if( key.startsWith( '$' ) ){
          modApi[ key.slice( 1 ) ] = modApi[ key ]
          delete modApi[ key ]
        }
      })

      Object.assign( api, modApi )
    }

    if( exposeState )
      Object.assign( api, { state } )

    stateCache.set( api, state )

    modules.forEach( plugin )

    apiCache.set( key, api )

    return api
  }

  const statics = Statics( Api, modules )

  Object.assign( Api, statics, { isState } )

  return Api
}

const validModules = modules =>
  is.array( modules ) && modules.every( is.function )

const Statics = ( Api, modules ) =>
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
  }, Api )

module.exports = ApiFactory
