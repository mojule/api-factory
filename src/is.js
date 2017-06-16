'use strict'

const Is = require( '@mojule/is' )

const plugin = plugin => Is.array( plugin ) && plugin.every( Is.function )

const plugins = plugins => {
  if( !Is.object( plugins ) ) return false

  const { core = [], statics = [], api = [], privates = [] } = plugins

  return (
    plugin( core ) && plugin( statics ) && plugin( api ) &&
    plugin( privates )
  )
}

const predicates = { plugin, plugins }
const is = Is( predicates )

module.exports = is
