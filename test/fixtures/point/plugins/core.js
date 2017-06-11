'use strict'

const is = require( '@mojule/is' )

const core = api => {
  api.createState = ( x, y ) => [ x, y ]
  api.getStateKey = state => state.join()

  api.isState = state =>
    is.array( state ) && is.number( state[ 0 ] ) && is.number( state[ 1 ] )
}

module.exports = [ core ]
