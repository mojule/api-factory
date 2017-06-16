'use strict'

const is = require( '../is' )

const ensureArray = value => {
  // allow a function or array of functions
  const arr = is.function( value ) ? [ value ] : value

  if( !is.plugin( arr ) )
    throw Error( 'Expected a function or array of functions' )

  return arr
}

const normalize = ( ...pluginSets ) =>
  pluginSets.map( plugins => {
    // allow a public api to be passed as just a function
    if( is.function( plugins ) )
      plugins = { api: plugins }

    if( !is.object( plugins ) )
      throw Error( 'Expected each plugin set to be an object' )

    const { core = [], statics = [], privates = [], api = [] } = plugins

    return {
      core: ensureArray( core ),
      statics: ensureArray( statics ),
      api: ensureArray( api ),
      privates: ensureArray( privates )
    }
  })

module.exports = normalize
