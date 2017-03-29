'use strict'

const is = require( '@mojule/is' )

const defaultOptions = {
  getStateKey: state => state,
  isState: state => true,
  exposeState: true,
  removePrivate: true,
  removeStatic: true
}

const ApiFactory = ( modules = [], options = {} ) => {
  if( !is.array( modules ) )
    modules = [ modules ]

  if( !validModules( modules ) )
    throw new Error( 'Expected modules to be an array of functions' )

  const {
    getStateKey, isState, exposeState, removePrivate, removeStatic
  } = Object.assign(
    {}, defaultOptions, options
  )

  const internalCache = new Map()
  const externalCache = new Map()

  const Api = state => CachedApi( state, externalCache, state => {
    let api = Internal( state )

    const prefixes = []

    if( removePrivate )
      prefixes.push( '_' )

    if( removeStatic )
      prefixes.push( '$' )

    if( prefixes.length > 0 )
      api = withoutPrefixes( api, prefixes )

    return api
  })

  const Internal = state => CachedApi( state, internalCache, state => {
    const api = newState => Internal( newState )

    addModules( modules, api, state )

    if( exposeState )
      Object.assign( api, { state } )

    return api
  })

  const CachedApi = ( state, cache, getApi ) => {
    if( !isState( state ) )
      throw new Error( 'Api state argument fails isState test' )

    const key = getStateKey( state )

    if( cache.has( key ) )
      return cache.get( key )

    const api = getApi( state )

    cache.set( key, api )

    return api
  }

  const addModules = ( modules, api, state ) => {
    const addModule = module =>
      Object.assign( api, module( api, state )  )

    modules.forEach( addModule )
  }

  const addStatics = ( modules, api ) => {
    const addStatic = module => {
      const fns = module( api )
      const fnames = Object.keys( fns )

      const staticNames = fnames.filter( name => name.startsWith( '$' ) )

      const staticFns = staticNames.reduce( ( statics, name ) => {
        const externalName = name.slice( 1 )

        statics[ externalName ] = fns[ name ]

        return statics
      }, {} )

      Object.assign( api, staticFns )
    }

    modules.forEach( addStatic )
  }

  const statics = {}

  addStatics( modules, statics )

  Object.assign( Api, statics, { isState } )

  return Api
}

const validModules = modules =>
  is.array( modules ) && modules.every( is.function )

const withoutPrefixes = ( api, prefixes ) => {
  const fnames = Object.keys( api )

  return fnames.reduce( ( newApi, name ) => {
    const hasPrefix = prefixes.some( prefix => name.startsWith( prefix ) )

    if( !hasPrefix )
      newApi[ name ] = api[ name ]

    return newApi
  }, {} )
}

module.exports = ApiFactory
