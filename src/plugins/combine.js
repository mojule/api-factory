'use strict'

const is = require( '../is' )
const normalize = require( './normalize' )

const combine = ( ...pluginSets ) => {
  const normalized = normalize( ...pluginSets )

  return normalized.reduce(
    ( combined, { core, statics, api, privates } ) => {
      combined.core.push( ...core )
      combined.statics.push( ...statics )
      combined.api.push( ...api )
      combined.privates.push( ...privates )

      return combined
    },
    { core: [], statics: [], api: [], privates: [] }
  )
}

module.exports = combine
