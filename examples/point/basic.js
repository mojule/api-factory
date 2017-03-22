'use strict'

const ApiFactory = require( '../../src' )

const pointModule = ( api, state ) => {
  return {
    x: () => state.x,
    y: () => state.y
  }
}

const Point = ApiFactory( pointModule )

const point = Point( { x: 5, y: 7 } )

console.log( point.x(), point.y() ) // 5 7
