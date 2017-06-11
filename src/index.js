'use strict'

const is = require( './is' )
const defaultPlugins = require( './plugins' )
const combine = require( './combinePlugins' )
const normalize = require( './normalizePlugins' )

const ApiFactory = ( ...plugins ) => {
  const apiCache = new Map()
  const stateCache = new Map()

  const coreState = { core: [
    coreApi => {
      coreApi.getState = api => stateCache.get( api )
      coreApi.getApi = state => apiCache.get( state )
    }
  ]}

  plugins = plugins.map( normalize )
  plugins = combine( defaultPlugins, coreState, ...plugins )

  const { core = [], publics = [], privates = [], statics = [] } = plugins

  const Api = ( ...args ) => {
    const { createState, getStateKey, isState, onCreate } = coreApi

    const state = createState( ...args )

    if( !isState( state ) )
      throw Error( 'Api state argument fails isState test' )

    const key = getStateKey( state )

    if( apiCache.has( key ) )
      return apiCache.get( key )

    const privateApi = privates.reduce( ( api, fn ) => {
      fn( api, state, coreApi, staticApi )

      return api
    }, {} )

    const publicApi = publics.reduce( ( api, fn ) => {
      fn( api, state, coreApi, privateApi, staticApi )

      return api
    }, {} )

    stateCache.set( publicApi, state )
    apiCache.set( key, publicApi )

    onCreate( publicApi )

    return publicApi
  }

  const staticApi = statics.reduce( ( api, fn ) => {
    fn( api )
    return api
  }, { create: Api } )

  const coreApi = core.reduce( ( api, fn ) => {
    fn( api, staticApi )
    return api
  }, {} )

  Object.assign( Api, staticApi )

  return Api
}

module.exports = ApiFactory
