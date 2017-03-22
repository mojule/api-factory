'use strict'

const ApiFactory = require( '../../src' )

const pointModule = ( api, state ) => {
  return {
    x: () => state.x,
    y: () => state.y
  }
}

const coreModule = ( api, state ) => {
  return {
    add: ( x, y ) => {
      const newX = api.x() + x
      const newY = api.y() + y

      return { x: newX, y: newY }
    }
  }
}

const Point = ApiFactory( [ pointModule, coreModule ] )

const p1 = { x: 5, y: 7 }

const point = Point( p1 )

const p2 = point.add( -1, 2 )

// original point is unaffected:
console.log( p1 ) // { x: 5, y: 7 }
console.log( p2 ) // { x: 4, y: 9 }
