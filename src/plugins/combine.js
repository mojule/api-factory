'use strict'

const is = require( '../is' )

const combine = ( ...plugins ) => {
  if( !plugins.every( is.plugins ) )
    throw new Error( 'Expected plugins' )

  return plugins.reduce(
    ( combined, { core = [], publics = [], privates = [], statics = [] } ) => {
      combined.core.push( ...core )
      combined.publics.push( ...publics )
      combined.privates.push( ...privates )
      combined.statics.push( ...statics )

      return combined
    },
    { core: [], publics: [], privates: [], statics: [] }
  )
}

module.exports = combine
