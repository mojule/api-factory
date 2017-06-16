'use strict'

const is = require( './is' )
const defaultPlugins = require( './plugins' )
const combine = require( './plugins/combine' )

const ApiFactory = ( ...pluginSets ) => {
  const plugins = combine( defaultPlugins, ...pluginSets )

  const Api = ( ...args ) => {
    const {
      createState, isState, onCreate,

      hasApi, getApi, memoizeApi
    } = core

    const state = createState( ...args )

    if( !isState( state ) )
      throw Error( 'Api state argument fails isState test' )

    if( hasApi( state ) )
      return getApi( state )

    const privates = plugins.privates.reduce( ( privates, fn ) => {
      fn({ privates, state, core, statics, Api })

      return privates
    }, {} )

    const api = plugins.publics.reduce( ( api, fn ) => {
      fn({ api, state, core, privates, statics, Api })

      return api
    }, {} )

    memoizeApi( api, state )
    onCreate( api )

    return api
  }

  const core = plugins.core.reduce( ( core, fn ) => {
    fn({ core, Api })

    return core
  }, {} )

  const statics = plugins.statics.reduce( ( statics, fn ) => {
    fn({ statics, Api })

    return statics
  }, {} )

  Object.assign( Api, statics )

  return Api
}

module.exports = ApiFactory
