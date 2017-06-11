'use strict'

const Is = require( '@mojule/is' )

const plugin = plugin => Is.array( plugin ) && plugin.every( Is.function )

const plugins = plugins => {
  if( !Is.object( plugins ) ) return false

  const { core, publics, privates, statics } = plugins

  if( core && !plugin( core ) )
    return false

  if( publics && !plugin( publics ) )
    return false

  if( privates && !plugin( privates ) )
    return false

  if( statics && !plugin( statics ) )
    return false

  return true
}

const predicates = { plugin, plugins }

const is = Is( predicates )

module.exports = is
