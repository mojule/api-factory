'use strict'

const Is = require( '@mojule/is' )

const plugin = plugin => Is.array( plugin ) && plugin.every( Is.function )

const plugins = plugins => {
  if( !Is.object( plugins ) ) return false

  const { core = [], publics = [], privates = [], statics = [] } = plugins

  return (
    plugin( core ) && plugin( publics ) && plugin( privates ) &&
    plugin( statics )
  )
}

const predicates = { plugin, plugins }
const is = Is( predicates )

module.exports = is
