'use strict'

const is = require( '@mojule/is' )

const core = ({ core }) => {
  core.createState = ( x, y ) => [ x, y ]
  core.getStateKey = state => state.join()

  core.isState = state =>
    is.array( state ) && is.number( state[ 0 ] ) && is.number( state[ 1 ] )
}

module.exports = [ core ]
