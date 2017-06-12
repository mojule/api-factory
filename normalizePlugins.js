'use strict'

const is = require( './is' )

const normalize = plugin => {
  if( is.plugins( plugin ) )
    return plugin

  if( is.plugin( plugin ) )
    return { publics: plugin }

  if( is.function( plugin ) )
    return { publics: [ plugin ] }

  throw Error( 'Expected plugins' )
}

module.exports = normalize
