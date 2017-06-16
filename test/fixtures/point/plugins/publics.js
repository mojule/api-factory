'use strict'

const publics = ({ api, state, core, Api }) => {
  Object.defineProperty( api, 'x', {
    get: () => state[ 0 ],
    set: x => state[ 0 ] = x
  })

  Object.defineProperty( api, 'y', {
    get: () => state[ 1 ],
    set: y => state[ 1 ] = y
  })

  api.add = point => {
    const pointState = core.getState( point )

    const newX = state[ 0 ] + pointState[ 0 ]
    const newY = state[ 1 ] + pointState[ 1 ]

    // not necessary, just testing getApi
    const result = core.getApi( [ newX, newY ] )

    if( result )
      return result

    return Api( newX, newY )
  }
}

module.exports = [ publics ]
