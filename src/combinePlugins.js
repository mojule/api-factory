'use strict'

const combine = ( ...plugins ) =>
  plugins.reduce(
    ( combined, { core = [], publics = [], privates = [], statics = [] } ) => {
      combined.core.push( ...core )
      combined.publics.push( ...publics )
      combined.privates.push( ...privates )
      combined.statics.push( ...statics )

      return combined
    },
    {
      core: [],
      publics: [],
      privates: [],
      statics: []
    }
  )

module.exports = combine
